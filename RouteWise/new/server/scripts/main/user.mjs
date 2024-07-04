import { ObjectId } from "mongodb";
import { collectionUsers, collectionRoutes } from "../database/conn.mjs";
import nodemailer from "nodemailer";
import CryptoJS from "crypto-js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const encrypt = (value) => CryptoJS.AES.encrypt(value, process.env.SECRET_AES_KEY).toString();
const decrypt = (value) => CryptoJS.AES.decrypt(value, process.env.SECRET_AES_KEY).toString(CryptoJS.enc.Utf8);

export const User = {
  create: async (request, response) => {
    try {
      const { username, email, password, confirmPassword } = request.body || {};
      if (!username || !email || !password || !confirmPassword) {
        return response.status(401).json("Campos obrigatórios em falta.");
      }

      const existingUser = await collectionUsers.findOne({
        $or: [{ "data.username": username }, { "contacts.email": email }],
      });

      if (existingUser) {
        const conflictField =
          existingUser.data.username === username ? "username" : "email";
        return response
          .status(409)
          .json(`Conflito: '${conflictField}' já existe.`);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return response.status(400).json("Formato de email inválido.");
      }

      if (password !== confirmPassword) {
        return response.status(400).json("As palavras-passe não coincidem.");
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = {
        _id: new ObjectId(),
        data: {
          username: username,
          name: null,
          birth: null,
          address: null,
          routes: null,
        },
        contacts: {
          email: encrypt(email),
          phone: null,
        },
        settings: {
          isDarkMode: null,
          mainColor: "#3498db",
        },
        auth: {
          password: hashedPassword,
        },
      };

      const result = await collectionUsers.insertOne(newUser);
      if (!result) response.status(401).json("Erro ao registar utilizador.");
      else response.status(201).json("Utilizador registado com sucesso.");
    } catch (error) {
      console.error("Erro ao registar utilizador:", error);
      response.status(500).json("Erro interno do servidor.");
    }
  },

  get: async (request, response) => {
    let id;
    if (!request.params.idUser) {
      id = request.id;
    } else if (request.params.idUser.length !== 24) {
      response.status(404).json("Não válido");
      return;
    } else {
      id = request.params.idUser;
    }
    let query = { _id: new ObjectId(id) };
    let projection = {
      projection: {
        _id: 1,
        data: 1,
        contacts: 1,
        settings: 1,
        auth: 1,
      },
    };
    let result = await collectionUsers.findOne(query, projection);
    if (!result) response.status(404).json("Não encontrado");
    else {
      response.status(200).json({
        _id: result._id,
        data: {
          username: result.data?.username,
          name: result.data?.name ? decrypt(result.data.name) : null,
          birth: result.data?.birth ? decrypt(result.data.birth) : null,
          address: result.data?.address ? decrypt(result.data.address) : null,
        },
        contacts: {
          email: result.contacts?.email ? decrypt(result.contacts.email) : null,
          phone: result.contacts?.phone ? decrypt(result.contacts.phone) : null,
        },
        settings: {
          isDarkMode:
            result.settings?.isDarkMode !== null
              ? Boolean(result.settings.isDarkMode)
              : null,
          mainColor: result.settings?.mainColor ?? null,
        },
        auth: {
          password: result.auth?.password ?? null,
        },
      });
    }
  },

  update: async (request, response) => {
    try {
      let id = request.id;

      let query = { _id: new ObjectId(id) };
      let userToUpdate = await collectionUsers.findOne(query);

      if (!userToUpdate) {
        return response.status(404).json("Utilizador não encontrado.");
      }

      const {
        email,
        password,
        name,
        birth,
        address,
        phone,
        isDarkMode,
        mainColor,
      } = request.body ?? {};

      const updateFields = {};
      if (name !== undefined) updateFields["data.name"] = name ? encrypt(name) : "";
      if (birth !== undefined) updateFields["data.birth"] = birth ? encrypt(birth) : "";
      if (address !== undefined) updateFields["data.address"] = address ? encrypt(address) : "";
      if (email !== undefined) updateFields["contacts.email"] = email ? encrypt(email) : "";
      if (phone !== undefined) updateFields["contacts.phone"] = phone ? encrypt(phone) : "";
      if (isDarkMode !== undefined) updateFields["settings.isDarkMode"] = isDarkMode !== null ? JSON.parse(isDarkMode) : false;
      if (mainColor !== undefined) updateFields["settings.mainColor"] = mainColor ? mainColor : "";
      if (password !== undefined && password !== "") {
        const hashedPassword = await bcrypt.hash(password, 12);
        updateFields["auth.password"] = hashedPassword;
      }

      const result = await collectionUsers.updateOne(query, {
        $set: updateFields,
      });

      if (result.modifiedCount === 1) {
        return response
          .status(200)
          .json("Dados do utilizador atualizados com sucesso.");
      } else {
        return response
          .status(404)
          .json("Utilizador não encontrado ou dados não modificados.");
      }
    } catch (error) {
      console.error("Erro ao atualizar utilizador:", error);
      return response.status(500).json("Erro interno do servidor.");
    }
  },

  delete: async (request, response) => {
    try {
      let id = request.id;

      if (!ObjectId.isValid(id)) {
        return response.status(400).json("ID de utilizador inválido.");
      }

      let query = { _id: new ObjectId(id) };

      const user = await collectionUsers.findOne(query);

      if (!user) {
        return response.status(404).json("Utilizador não encontrado.");
      }

      const result = await collectionUsers.deleteOne(query);

      if (result.deletedCount === 0) {
        return response.status(404).json("Utilizador não encontrado.");
      }

      if (user.data && user.data.routes) {
        await collectionRoutes.deleteOne({ _id: new ObjectId(user.data.routes) });
      }

      return response.status(200).json("Utilizador e rotas associadas removidos com sucesso.");
    } catch (error) {
      console.error("Erro ao eliminar utilizador:", error);
      return response.status(500).json("Erro no servidor.");
    }
  },

  login: async (request, response) => {
    let { username, password, rememberMe } = request.body;
    if (!username) {
      response.status(401).json("Insira o nome de utilizador!");
      return;
    } else if (!password) {
      response.status(401).json("Insira a palavra-passe!");
      return;
    } else {
      let query = { "data.username": username };
      let result = await collectionUsers.findOne(query);
      if (!result) response.status(401).json("Utilizador não encontrado!");
      else if (!bcrypt.compareSync(password, result.auth.password))
        response.status(401).json("Inválido!");
      else {
        let expiresIn = request.body.rememberMe === "true" ? "7d" : "5h";
        jwt.sign(
          {
            id: encrypt(new ObjectId(result._id).toString()),
            username: encrypt(result.data.username),
          },
          process.env.SECRET_TOKEN_KEY,
          { expiresIn },
          (error, token) => {
            if (error) throw error;
            response.status(200).json(token);
          }
        );
        return;
      }
    }
  },

  forgotPassword: async (request, response) => {
    const email = request.body.email;

    try {
      const users = await collectionUsers.find().toArray(); 
      const user = users.find(user => decrypt(user.contacts.email) === email);

      if (!user) {
        return response.status(404).json("Não foi encontrado um utilizador com esse email.");
      }

      const resetToken = jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN_KEY, { expiresIn: '1h' });

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'email@ethereal.email',
          pass: 'password'
        }
      });

      let message = {
        from: 'RouteWise <no-reply@routewise.com>',
        to: decrypt(user.contacts.email),
        subject: 'Redefinição de Palavra-Passe',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: sans-serif; background-color: #f4f4f4; color: #333; }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
                background-color: #fff; 
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }
              h2 { color: #333; }
              .button { 
                display: inline-block; 
                padding: 10px 20px; 
                background-color: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
              }
              .logo { 
                font-size: 24px; 
                font-weight: bold; 
              }
              .logo span { color: ${user.settings?.mainColor || '#007bff'}; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="logo">Route<span>Wise</span></h1>
              <h2>Olá, ${user.data.username}!</h2>
              <p>Recebemos uma solicitação para redefinir a palavra-passe da sua conta RouteWise em <b>${new Date().toLocaleString()}</b>.</p>
              <p>Para redefinir a sua palavra-passe clique no botão abaixo, caso o botão não funcione copie e cole o link abaixo no seu navegador:</p>
      
              <a href="http://127.0.0.1:5550/new/client/pages/auth/reset-password.html?token=${resetToken}" class="button">Redefinir Senha</a>
      
              <p>Link para redefinição de palavra-passe:</p>
              <p><a href="http://127.0.0.1:5550/new/client/pages/auth/reset-password.html?token=${resetToken}">http://127.0.0.1:5550/new/client/pages/auth/reset-password/${resetToken}</a></p>
      
              <p>Este link expirará em <b>1 hora</b>.</p>
              <p>Se você não solicitou a redefinição da palavra-passe, pode ignorar este email. Sua palavra-passe permanecerá inalterada.</p>
              <p>Se precisar de ajuda, entre em contato com nossa equipa de suporte em <a href="mailto:support@routewise.com">support@routewise.com</a>.</p>
            </div>
          </body>
          </html>
        `
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log("Ocorreu um erro. " + err.message);
          return response.status(500).json("Erro ao enviar email");
        }

        console.log("Email enviado: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        response.json("Email enviado, verifique a sua caixa de entrada.");
      });
  } catch (error) {
      console.error(error);
      response.status(500).json("Erro no servidor.");
  }
},

resetPassword: async (request, response) => {
  const resetToken = request.params.token;
  const { password } = request.body;

  try {
      const decodedToken = jwt.verify(resetToken, process.env.SECRET_TOKEN_KEY);
      const userId = decodedToken.userId;

      let query = { _id: new ObjectId(userId) };
      const user = await collectionUsers.findOne(query);
      
      if (!user) {
          return response.status(404).json('Utilizador não encontrado.');
      }

      const hashedPassword = await bcrypt.hash(password, 12); 

      const updateResult = await collectionUsers.updateOne(
          query,
          { $set: { 'auth.password': hashedPassword } }
      );

      if (updateResult.modifiedCount === 1) {
          response.json('Palavra-passe redefinida com sucesso.'); 
      } else {
          response.status(404).json('Utilizador não encontrado.');
      }

  } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
          return response.status(401).json('Token expirado.');
      }
      
      console.error('Erro ao redefinir palavra-passe:', error);
      response.status(500).json('Erro no servidor.'); 
  }
},
};

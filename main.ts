<<<<<<< HEAD
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
=======
// import "https://deno.land/x/dotenv@v3.2.0/load.ts";
>>>>>>> 879d1d9478d5edc2cda2fbf93a6f134f9afb9d29
import { MongoClient, ObjectId } from "mongodb";
import {
  fromModelToUsuario,
  fromModelToProyecto,
  fromModelToTarea,
} from "./utils.ts";
import type { UsuarioDB, ProyectoDB, TareaDB } from "./types.ts";

const url = Deno.env.get("MONGO_URL");
if (!url) {
  throw new Error("MONGO_URL no está configurado.");
}

// Crea y conecta un cliente de MongoDB
const client = new MongoClient(url);
await client.connect();
console.log("Conectado a la base de datos");

const dbName = "NebrijaDB-4";
const db = client.db(dbName);

const coleccionUsuarios = db.collection<UsuarioDB>("usuarios");
const coleccionProyectos = db.collection<ProyectoDB>("proyectos");
const coleccionTareas = db.collection<TareaDB>("tasks");

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  //Manejo de solicitudes metodo GET
  if (method === "GET") {
    if (path === "/users") {
      //Devuelve todos los usuarios
      const usuariosDB = await coleccionUsuarios.find().toArray();
      return new Response(JSON.stringify(usuariosDB.map(fromModelToUsuario)), {
        headers: { "Content-Type": "application/json" },
      });
    } else if (path === "/projects") {
      //Devuelve todos los proyectos
      const proyectosDB = await coleccionProyectos.find().toArray();
      return new Response(
        JSON.stringify(proyectosDB.map(fromModelToProyecto)),
        { headers: { "Content-Type": "application/json" } }
      );
    } else if (path === "/projects/by-user") {
      const user_id = url.searchParams.get("user_id");
      if (!user_id) {
        return new Response(
          JSON.stringify({
            error: "No hay id",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const proyectosDBm = await coleccionProyectos
        .find({ user_id: new ObjectId(user_id) })
        .toArray();
      const proyectosDB = proyectosDBm.map((u) => fromModelToProyecto(u));

      return new Response(JSON.stringify(proyectosDB), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else if (path === "/tasks") {
      //Devuelve todas las tareas
      const tareasDB = await coleccionTareas.find().toArray();
      return new Response(JSON.stringify(tareasDB.map(fromModelToTarea)), {
        headers: { "Content-Type": "application/json" },
      });
    } else if (path === "/tasks/by-project") {
      const proyectoId = url.searchParams.get("project_id");
      if (!proyectoId) {
        return new Response(
          JSON.stringify({
            error: "No hay id",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const tareasDBm = await coleccionTareas
        .find({ project_id: new ObjectId(proyectoId) })
        .toArray();
      const tareasDB = tareasDBm.map((u) => fromModelToTarea(u));

      return new Response(JSON.stringify(tareasDB), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
    //Manejo de solicitudes metodo POST
  } else if (method === "POST") {
    if (path === "/users") {
      //Recoges la informacion de la request => body
      const body = await req.json();
      const { name, email } = body;
      if (!name || !email)
        return new Response(JSON.stringify({ error: "Faltan datos" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      const created_at = new Date();
      const { insertedId } = await coleccionUsuarios.insertOne({
        name,
        email,
        created_at,
      });
      const insertedUser = fromModelToUsuario({
        _id: insertedId,
        name,
        email,
        created_at,
      });
      if (insertedUser) {
        return new Response(JSON.stringify({ insertedUser }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (path === "/projects") {
      const body = await req.json();
      const { name, description, start_date, user_id } = body;
      if (!name || !start_date || !user_id)
        return new Response(JSON.stringify({ error: "FAltan datos." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      const { insertedId } = await coleccionProyectos.insertOne({
        name,
        description,
        start_date: new Date(start_date),
        end_date: undefined,
        user_id: new ObjectId(user_id),
      });
      const insertedProject = fromModelToProyecto({
        _id: insertedId,
        name,
        description,
        start_date: new Date(start_date),
        end_date: undefined,
        user_id: new ObjectId(user_id),
      });
      return new Response(JSON.stringify({ insertedProject }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else if (path === "/tasks/move") {
      const body = await req.json();
      const { task_id, destination_project_id, origin_project_id } = body;
      if (!task_id || !destination_project_id)
        return new Response(
          JSON.stringify({
            error: "Faltan Datos.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      const tareaActualizadaM = await coleccionTareas.findOne({
        _id: new ObjectId(task_id),
      });
      if (!tareaActualizadaM)
        return new Response(
          JSON.stringify({
            error: "tarea no existe.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      const proyectoDestino = await coleccionProyectos.findOne({
        _id: new ObjectId(destination_project_id),
      });
      if (!proyectoDestino) {
        return new Response(
          JSON.stringify({ error: "Destination project not found." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      if (origin_project_id) {
        const originProject = await coleccionProyectos.findOne({
          _id: new ObjectId(origin_project_id),
        });
        if (!originProject) {
          return new Response(
            JSON.stringify({ error: "Origin project not found." }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        // Verificar que la tarea pertenezca al proyecto origen
        if (tareaActualizadaM.project_id.toString() !== origin_project_id) {
          return new Response(
            JSON.stringify({
              error: "La tarea no pertenece al proyecto de origen.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      //Actualizar el project_id de la tarea
      const result = await coleccionTareas.updateOne(
        { _id: new ObjectId(task_id) },
        { $set: { project_id: new ObjectId(destination_project_id) } }
      );

      if (result.modifiedCount === 0) {
        return new Response(
          JSON.stringify({ error: "Failed to move the task." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const tareaActualizada = fromModelToTarea(tareaActualizadaM);
      return new Response(
        JSON.stringify({
          Message: "Task moved successfully.",
          task: { ...tareaActualizada },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    } else if (path === "/tasks") {
      const body = await req.json();
      const {
        title,
        description,
        status = "pending",
        due_date,
        project_id,
      } = body;
      const created_at = new Date();
      if (!title || !project_id)
        return new Response("Faltan datos", { status: 400 });
      const { insertedId } = await coleccionTareas.insertOne({
        title,
        description,
        status,
        created_at,
        due_date: due_date ? new Date(due_date) : undefined,
        project_id: new ObjectId(project_id),
      });

      return new Response(
        JSON.stringify({
          id: insertedId.toString(),
          title,
          description,
          status,
          created_at,
          due_date,
          project_id,
        }),
        { status: 201 }
      );
    }
  } else if (method === "DELETE") {
    if (path === "/users") {
      const id = url.searchParams.get("id");
      if (!id)
        return new Response(JSON.stringify({ error: "Falta el id" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      const result = await coleccionUsuarios.deleteOne({
        _id: new ObjectId(id),
      });
      if (!result.deletedCount) {
        return new Response(
          JSON.stringify({
            error: " usuario no encontrado => no borrado ",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Usuario eliminado" }));
    } else if (path === "/projects") {
      const id = url.searchParams.get("id");
      if (!id)
        return new Response(JSON.stringify({ error: "Falta el id" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      const result = await coleccionProyectos.deleteOne({
        _id: new ObjectId(id),
      });
      if (!result.deletedCount) {
        return new Response(
          JSON.stringify({
            error: " proyecto no encontrado => no borrado ",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Proyecto eliminado" }));
    } else if (path === "/tasks") {
      const id = url.searchParams.get("id");
      if (!id)
        return new Response(JSON.stringify({ error: "Falta el id" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      const result = await coleccionTareas.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount) {
        return new Response(
          JSON.stringify({
            error: " tarea no encontrada => no borrada ",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ message: "Tarea eliminada" }));
    }
  }

  return new Response(
    JSON.stringify({
      error: "Ruta no encontrada",
    }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
};

Deno.serve({ port: 8000 }, handler);

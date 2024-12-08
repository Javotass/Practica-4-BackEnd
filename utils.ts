import type{ Collection } from "mongodb";
import type{ UsuarioDB, Usuario, ProyectoDB, Proyecto, TareaDB, Tarea} from "./types.ts";


export const fromModelToUsuario = (modelo: UsuarioDB): Usuario => ({
  id: modelo._id!.toString(),
  name: modelo.name,
  email: modelo.email,
  created_at: modelo.created_at,
});

export const fromModelToProyecto = (modelo: ProyectoDB): Proyecto => ({
  id: modelo._id!.toString(),
  name: modelo.name,
  description: modelo.description,
  start_date: modelo.start_date,
  end_date: modelo.end_date,
  user_id: modelo.user_id.toString(),
});

export const fromModelToTarea = (modelo: TareaDB): Tarea => ({
  id: modelo._id!.toString(),
  title: modelo.title,
  description: modelo.description,
  status: modelo.status,
  created_at: modelo.created_at,
  due_date: modelo.due_date,
  project_id: modelo.project_id.toString(),
});

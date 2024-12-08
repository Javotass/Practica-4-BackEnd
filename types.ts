import { ObjectId, OptionalId } from "mongodb";

export type UsuarioDB = OptionalId<{
  name: string;
  email: string;
  created_at: Date;
}>;

export type ProyectoDB= OptionalId<{
  name: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  user_id: ObjectId;
}>;

export type TareaDB = OptionalId<{
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  created_at: Date;
  due_date?: Date;
  project_id: ObjectId;
}>;

export type Usuario = {
  id: string;
  name: string;
  email: string;
  created_at: Date;
};

export type Proyecto = {
  id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date?: Date;
  user_id: string;
};

export type Tarea = {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  created_at: Date;
  due_date?: Date;
  project_id: string;
};

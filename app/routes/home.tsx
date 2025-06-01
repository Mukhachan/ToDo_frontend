import type { Route } from "./+types/home";
import { Header } from "~/components/Header";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';


const DOMAIN = import.meta.env.VITE_API_DOMAIN

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Список задач" },
    { name: "description", content: "Твой список задач на каждый день!" },
  ];
}

const getTasks = async (): Promise<{ [key: string]: any }> => {
  const authToken = Cookies.get('sessionId')

  if (authToken){ 
    const response = await fetch(`http://${DOMAIN}/tasks`,{
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
      }
    )
    return {
      state: response.status,
      data: await response.json()
    };}
  else {
    return {
      state: 401,
      data: []
    }
  }
}

const saveTask = async (id: string, body: JSON) => {
    await fetch(`http://${DOMAIN}/tasks/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('sessionId')}`
        },
      body: JSON.stringify(body)
    })
    
    return {
      state: 200,
      data: []
      }
    }

const deleteTask = async (id: string) => {
  const response = await fetch(`http://${DOMAIN}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Cookies.get('sessionId')}`
    }
  })
  
  return {
    state: response.status,
    data: []
    }
}

const Save: React.FC = () => {
  const [tasks, setTasks] = useState({});

  return (
    <button
          className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-2 px-4 rounded"
        > Сохранить
    </button>
  )
}




export default function Home() {
  const [tasks, setTasks] = useState<{ [key: string]: any } | null>(null);
  const [tasks_state, setTasksState] = useState({});
  
  const updateTask = async (taskId: string, updatedData: any) => {
    await saveTask(taskId, updatedData);
    console.log(tasks)
  };  
  const fetchTasks = async () => {
      const data = await getTasks();
      setTasks(data.data);
      setTasksState(data.state);
  };
  useEffect(() => {
     setInterval(() => fetchTasks(), 5000);
  }, []);

  const delTask = async (taskId: string) => {
    const res = await deleteTask(taskId);
    if (res.state === 200) {
      await fetchTasks();
    }

  }

  return (
    <main className="flex flex-col gap-4 pt-12 pb-4 font-[Comfortaa]">
      <Header/>
      <div className="flex justify-center items-center text-[24pt]">Список задач</div>
      <div className="flex justify-center h-[100%] w-[100%]">
        <table className="border-collapse">
          <thead>
            <tr className="">
              <th className="border p-2">№</th>
              <th className="border p-2">Название</th>
              <th className="border p-2">Описание</th>
              <th className="border p-2">Дата</th>
              <th className="border p-2">Состояние</th>
              <th className="border p-2">Удалить</th>
            </tr>
          </thead>
          <tbody className="">
            { tasks && tasks_state == 200 ? (
              tasks.map((task) => (
                <tr className="" id={task.id} key={task.id}>
                  <td className="border p-2">{task.num}</td>
                  <td className="border p-2">
                    <input key={task.id} type="text" onChange={()=>{}} onBlur={(e) => { updateTask(
                        task.id, 
                        { 
                          num: task.id,
                          title: e.target.value,
                          description: task.description,
                          status: task.status,
                        }
                      )
                    }} defaultValue={task.title}/>
                  </td>
                  <td className="border p-2"><input key={task.id} type="text" onChange={(e)=>{e.target.value}} onBlur={(e) => { updateTask(
                        task.id, 
                        { 
                          num: task.id,
                          title: task.value,
                          description: e.target.value,
                          status: task.status,
                        }
                      )
                    }}  defaultValue={task.description}/></td>
                  <td className="border p-2">{task.created_at}</td>
                  <td className="border p-2">{
                    task.status ? (
                      <input type="checkbox" name="" id={task.id} value={task.status} checked/>
                    ) : (
                      <input type="checkbox" name="" id={task.id} value={task.status}/>
                    )
                  }
                    </td>
                  <td className="border p-2">
                    <div className="h-[100%] w-[100%] flex justify-center items-center">
                      <button onClick={() => {delTask(task.id)}} className="bg-red-400 hover:bg-red-500 text-gray-900 font-bold h-[36px] w-[36px] rounded">X</button>
                    </div>
                  </td>
                </tr>
            ))
            ) : tasks_state == 401 ? (
                <tr className="flex justify-center items-center">
                  <td>Вы не авторизованы</td>
                </tr>
            ) : (
                <tr className="flex justify-center items-center">
                  <td>Загрузка задач...</td>
                </tr>
             )
            }

          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center"><Save/></div>
    </main>
);
}

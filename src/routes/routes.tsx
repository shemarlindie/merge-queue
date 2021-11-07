import {QueueList} from "../queue/components/QueueList";
import {Login} from "../auth/components/Login";
import {NotFound} from "./components/NotFound";
import {Navigate, RouteObject} from "react-router-dom";
import {Layout} from "../layout/components/Layout";
import {RequireAuth} from "./components/RequireAuth";
import {QueueManage} from "../queue/components/QueueManage";

export const routeConfig: RouteObject[] = [
  {
    path: "/",
    element: <Layout/>,
    children: [
      {index: true, element: <Navigate to="/queues"/>},
      {path: "/queues", element: <RequireAuth><QueueList/></RequireAuth>},
      {
        path: "/queues/:queueId",
        element: <RequireAuth><QueueManage/></RequireAuth>
      },
      {path: "/login", element: <Login/>},
      {path: "*", element: <NotFound/>},
    ]
  }
];

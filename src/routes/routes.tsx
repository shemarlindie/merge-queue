import {QueueList} from "../components/queue/QueueList";
import {Login} from "../components/auth/Login";
import {NotFound} from "./NotFound";
import {Navigate, RouteObject} from "react-router-dom";
import {Layout} from "../components/layout/Layout";
import {RequireAuth} from "./RequireAuth";
import {QueueManage} from "../components/queue/QueueManage";

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

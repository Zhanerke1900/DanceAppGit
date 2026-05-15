
  import { createRoot } from "react-dom/client";
  // Главный компонент
  import App from "./app/App.tsx";
  // Общие стили
  import "./styles/index.css";

  // Запуск React
  createRoot(document.getElementById("root")!).render(<App />);
  

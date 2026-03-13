
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </QueryClientProvider>
)
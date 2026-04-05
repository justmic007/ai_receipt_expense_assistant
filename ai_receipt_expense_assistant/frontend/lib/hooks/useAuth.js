import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout, selectUser, selectIsAuthenticated } from "@/store/authSlice";
import api from "@/lib/api";

export function useAuth() {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return { user, isAuthenticated };
}
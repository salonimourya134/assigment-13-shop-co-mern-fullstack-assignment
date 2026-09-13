import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import API from "../services/api";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/api/products", {
                params: { page: 1, limit: 100, sort: "new" },
            });
            if (data?.success) setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await API.get("/api/categories");
            if (data?.success) setCategories(data.categories || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]);
        }
    }, []);

    useEffect(() => {
        fetchAllProducts();
        fetchCategories();
    }, [fetchAllProducts, fetchCategories]);

    return (
        <ProductContext.Provider
            value={{ products, setProducts, categories, setCategories, loading, fetchAllProducts, fetchCategories }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => useContext(ProductContext);

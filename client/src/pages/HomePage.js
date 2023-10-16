import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import { Checkbox, Radio, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [value, setValue] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [cart, setCart] = useCart();

  //get all category
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);

  //get all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts(data?.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  //get total count

  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  //load more
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  //get filtered products
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        value,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (checked.length === 0 && value.length === 0) {
      getAllProducts();
    } else {
      filterProduct();
    }
  }, [checked, value]);

  //options for antd
  let Options = [];
  for (let i = 0; i < categories.length; i++) {
    Options.push({
      label: categories[i].name,
      value: categories[i]._id,
    });
  }
  return (
    <Layout title={"All Products- Best Offers"}>
      <div className="row mt-3">
        <div className="col-md-2">
          <h4 className="text-center">Filter by Category</h4>
          <Checkbox.Group
            options={Options}
            onChange={(e) => {
              setChecked(e);
            }}
          />
          {/* Price Filter */}
          <h4 className="text-center mt-4">Filter by Price</h4>
          <Radio.Group onChange={(e) => setValue(e.target.value)} value={value}>
            <Space direction="vertical">
              {Prices?.map((p) => (
                <Radio key={p?._id} value={p?.array}>
                  {p?.name}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
          <div className="d-flex flex-column">
            <button
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              RESET FILTERS
            </button>
          </div>
        </div>
        <div className="col-md-9">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products?.map((p) => (
              <div className="card m-2" style={{ width: "18rem" }} key={p?._id}>
                <img
                  src={`/api/v1/product/product-photo/${p?._id}`}
                  className="card-img-top"
                  alt={p?.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{p?.name}</h5>
                  <p className="card-text">
                    {p?.description.substring(0, 30)}...
                  </p>
                  <p className="card-text">$ {p?.price}</p>
                  <button
                    className="btn btn-primary ms-1"
                    onClick={() => {
                      navigate(`/product/${p?.slug}`);
                    }}
                  >
                    More Details
                  </button>
                  <button
                    className="btn btn-secondary ms-1"
                    onClick={() => {
                      setCart([...cart, p]);
                      toast.success("Item added to cart");
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="m-2 p-3">
            {products && products.length < total && (
              <button
                className="btn btn-warning"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {loading ? "Loading...." : "Loadmore"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;

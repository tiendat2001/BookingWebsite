import { useEffect, useState } from "react";
import axios from "axios";
const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api${url}`);
        setData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Redirect to login page
          window.location.href = '/login'; // Thay đổi đường dẫn đến trang đăng nhập của bạn
        } else {
          console.log(err)
          setError(err);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [url]);
// url de tu dong reFecth moi khi api thay doi
  const reFetch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api${url}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;

import { useEffect, useState } from "react";
import axios from "axios";

function SalesHistory({ refresh }) {

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getSales();

  }, [refresh]);

  const getSales = async () => {

  const response = await axios.get(
    "http://127.0.0.1:5000/api/products/sales"
  );

  setSales(response.data);

  setLoading(false);

};

if (loading) {

  return <p>Cargando ventas...</p>;

}
  return (

    <div>

      <h2>Historial de ventas</h2>

      {sales.map((sale) => (

        <div key={sale._id}>

          <h3>
            Total: ${sale.total}
          </h3>

          <p>
            {new Date(
              sale.createdAt
            ).toLocaleString()}
          </p>

          {sale.products.map((product,index)=>(

            <p key={index}>

              {product.name}

              {" - "}

              x{product.quantity}

            </p>

          ))}

          <hr/>

        </div>

      ))}

    </div>

  );

}

export default SalesHistory;
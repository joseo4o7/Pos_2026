function Dashboard({ products, sales }) {

  const totalProducts = products.length;

  const totalSales = sales.length;

  const totalMoney = sales.reduce(
    (sum, sale) => sum + sale.total,
    0
  );

  const lowStock = products.filter(
    (product) => product.stock <= 3
  ).length;

  return (

    <div className="dashboard">

      <div className="dashboard-card">

        <h3>📦 Productos</h3>

        <h2>{totalProducts}</h2>

      </div>

      <div className="dashboard-card">

        <h3>💰 Total vendido</h3>

        <h2>${totalMoney}</h2>

      </div>

      <div className="dashboard-card">

        <h3>🧾 Ventas</h3>

        <h2>{totalSales}</h2>

      </div>

      <div className="dashboard-card">

        <h3>⚠ Stock bajo</h3>

        <h2>{lowStock}</h2>

      </div>

    </div>

  );

}

export default Dashboard;
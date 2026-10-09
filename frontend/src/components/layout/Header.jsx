function Header({ user }) {

  return (

    <div className="header">

      <h1>PUNTO ELECTRÓNICO</h1>

      <div>

        👤 {user.fullName}

      </div>

    </div>

  );

}

export default Header;
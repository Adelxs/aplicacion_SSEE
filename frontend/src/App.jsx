import { useEffect, useState } from "react";

function App() {

  const [hogares, setHogares] = useState([]);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/hogares")
      .then(response => response.json())
      .then(data => {
        setHogares(data);
      });

  }, []);

  return (
    <div>

      <h1>Sistema SSEE</h1>

      <h2>Hogares</h2>

      <ul>
        {hogares.map(hogar => (
          <li key={hogar.id}>
            {hogar.cuidador_principal} -
            {hogar.psdf} -
            {hogar.unidad_vecinal}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;
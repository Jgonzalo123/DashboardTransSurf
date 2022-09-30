async function iniciarSesion() {
  let login = {
    numDocOrEmail: document.getElementById("iDNIEmail").value,
    password: document.getElementById("iPassword").value
  };

  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(login)
  });
  if (response.status == 200) {
    let content = await response.json();
    localStorage.token = content["tokenAcceso"];
    localStorage.numDocOrEmail = login.numDocOrEmail;
    location.href = "../../index.html";
  } else {
    
  }
}

document.getElementById("btnLogin").addEventListener("click", () => {
  iniciarSesion();
});
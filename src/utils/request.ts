export default async function request(url = "", method = "GET", data = {}) {
  // Opciones por defecto estan marcadas con un *
  const response = await fetch(url, {
    method,
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow", // manual, *follow, error
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });

  return response.json(); // parses JSON response into native JavaScript objects
}

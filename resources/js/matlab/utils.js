export async function fetchMatlabScript(url, formData) {
  return fetch(url, {
    method: "POST",
    body: formData,
  })
    .then(async (response) => {
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/octet-stream")) {
        return response.arrayBuffer();
      } else {
        const error = await response.text();
        return Promise.reject(error);
      }
    })
    .catch((error) => {
      console.log(error);
      waitingPopup.hideLoading();
      swalTailwind.fire({
        icon: "error",
        html: `
        ${error}
      `,
        showConfirmButton: true,
      });
      Array.from(Array(11), (_, index) => index + 1).forEach((index) => {
        Plotly.purge(`zapata${index}`);
      });
      pdfButton.disabled = true;
      pdfButton.className = "bg-gray-500 text-white font-bold py-2 px-4 border-b-4 border-gray-700 rounded";
    });
}
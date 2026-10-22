//formatada datas para o formato dd/mm/aaaa

function dataBR(data) {
  if (!data) return "";
  const d = new Date(data);
  if (isNaN(d.getTime())) return String(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return dia + "/" + mes + "/" + d.getFullYear();
}

module.exports = { dataBR };

import zip from 'jszip';
import XLSX from 'xlsx';

const rawZip = await fetch('https://www.insee.fr/fr/statistiques/fichier/2028028/table-appartenance-geo-communes-22_V2.zip');
const zipData = await rawZip.arrayBuffer();
const zipFile = await zip.loadAsync(zipData);

// console.log(Object.keys(b.files));
const [filename] = Object.keys(zipFile.files).filter(name => name.match(/\.xlsx/));
const xlsxFile = await zipFile.file(filename).async('arraybuffer');
const workbook = XLSX.read(xlsxFile);
const worksheet = workbook.Sheets['COM'];
const allCities = XLSX.utils.sheet_to_json(worksheet, { range: 5 });

const foundInsee = new Set();
const uniqCities = allCities.filter(({ CODGEO: code_commune_INSEE }) => {
  if (foundInsee.has(code_commune_INSEE)) {
    return false;
  }
  foundInsee.add(code_commune_INSEE);
  return true;
});

const allNames = new Set();
const cityDuplicates = uniqCities.filter(({ LIBGEO: nom_commune }) => {
  if (allNames.has(nom_commune)) { return true; }
  allNames.add(nom_commune);
  return false;
});

const duplicateNames = new Set(cityDuplicates.map(({ LIBGEO: nom_commune }) => nom_commune));

const duplicateCities = uniqCities
  .filter(({ LIBGEO: nom_commune }) => duplicateNames.has(nom_commune))
  .reduce((acc, { LIBGEO: nom_commune, ...rest }) => {
    if (!acc[nom_commune]) {
      acc[nom_commune] = [];
    }
    acc[nom_commune].push(rest);

    return acc;
  }, {});

const list = Object.entries(duplicateCities).map(([nom_commune, duplicates]) => ({
  nom: nom_commune,
  nombre: duplicates.length,
  'codes INSEE': duplicates.map(({ CODGEO: code_commune_INSEE }) => code_commune_INSEE).join(', '),
  departements: duplicates.map(({ DEP: code_departement }) => code_departement).join(', '),
}));

list
  .sort((a, b) => {
    if (b.nombre - a.nombre) {
      return b.nombre - a.nombre;
    }
    return a.nom.localeCompare(b.nom)
  });
const csv = list.map(row => Object.values(row).join('\t')).join('\n');

process.stdout.write(Object.keys(list[0]).join('\t') + '\n');
process.stdout.write(csv + '\n');

// https://www.data.gouv.fr/fr/datasets/communes-de-france-base-des-codes-postaux/
const rawData = await fetch('https://static.data.gouv.fr/resources/communes-de-france-base-des-codes-postaux/20200309-131459/communes-departement-region.csv');
const rawCSV = await rawData.text();

const rows = rawCSV.toString().split('\n').filter(Boolean);
const headers = rows.shift().split(',');

// Quick & dirty CSV to Object
const allCities = rows.map(row => {
  const fields = row.split(',');
  return Object.fromEntries(headers.map((header, index) => [header, fields[index]]));
});

const foundInsee = new Set();
const uniqCities = allCities.filter(({ code_commune_INSEE }) => {
  if (foundInsee.has(code_commune_INSEE)) {
    return false;
  }
  foundInsee.add(code_commune_INSEE);
  return true;
});

const allNames = new Set();
const cityDuplicates = uniqCities.filter(({ nom_commune }) => {
  if (allNames.has(nom_commune)) { return true; }
  allNames.add(nom_commune);
  return false;
});

const duplicateNames = new Set(cityDuplicates.map(({ nom_commune }) => nom_commune));

const duplicateCities = uniqCities
  .filter(({ nom_commune }) => duplicateNames.has(nom_commune))
  .reduce((acc, { nom_commune, ...rest }) => {
    if (!acc[nom_commune]) {
      acc[nom_commune] = [];
    }
    acc[nom_commune].push(rest);

    return acc;
  }, {});

const list = Object.entries(duplicateCities).map(([nom_commune, duplicates]) => ({
  nom: nom_commune,
  occurrences: duplicates.length,
  'nom complet': duplicates.map(({ nom_commune_complet }) => nom_commune_complet).join(', '),
  'codes INSEE': duplicates.map(({ code_commune_INSEE }) => code_commune_INSEE).join(', '),
  departements: duplicates.map(({ nom_departement, code_departement }) => `${nom_departement} (${code_departement})`).join(', '),
}));

list.sort(({ occurrences: a }, { occurrences: b }) => b - a);
const csv = list.map(row => Object.values(row).join('\t')).join('\n');

process.stdout.write(Object.keys(list[0]).join('\t') + '\n');
process.stdout.write(csv + '\n');

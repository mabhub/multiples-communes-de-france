Petit script pas optimisé pour identifier les occurrences multiples de certains
noms de communes.

*Nécessite une version de NodeJS supérieure ou égale à `18.0.0`*

## Utilisation

```shell
npm install
node index.mjs > communes.csv
```

## Données

Les données proviennent du site de l'[INSEE](https://www.insee.fr/), et plus
particulièrement du jeu de données [Découpage
communal](https://www.insee.fr/fr/information/2028028).

## Dépendances

Pour traiter le fichier `zip`, on utilise le paquet
[JSZip](https://github.com/Stuk/jszip). Pour interpreter ensuite le fichier
`xlsx` qu'il contient, on utilise le paquet
[xlsx](https://github.com/SheetJS/sheetjs).

# exports/

Pasta para armazenar backups exportados do app.

**IMPORTANTE:** Arquivos `.json` e `.csv` desta pasta são ignorados pelo `.gitignore`
para proteger seus dados pessoais de serem subidos ao GitHub.

## Como exportar

No browser (F12 > Console):
```javascript
const dados = localStorage.getItem('habitSciencePro2026Complete');
const blob = new Blob([dados], {type:'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `habitdb_backup_${new Date().toISOString().split('T')[0]}.json`;
a.click();
```

Salve o arquivo baixado nesta pasta para organização local.

// Modulators: tempo-synced LFOs and shapes for LUNA. Pick a parameter of the selected track
// (volume, pan or any plug-in parameter), a shape, a rate and a range, and it is written as
// automation over the selection, the loop or a number of bars: movement you can see and edit.
//
// Automation lanes hold the control's native value, which is not the 0..1 a knob shows, so the
// add-on measures each control once (normalized in, native out) and maps through that table.

(() => {
  const $ = (id) => document.getElementById(id);
  const VERSION = '1.0.4';
  const KEY = 'com.fedetrillo.modulators.';
  const store = {
    get: (k) => { try { return JSON.parse(localStorage.getItem(KEY + k)); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* not fatal */ } },
  };
  const I18N = {
    es: { instrument: 'instrumento', _name: 'Español', target: 'Destino:', noTrack: 'Selecciona una pista en LUNA', modulated: 'Modulados', search: 'Buscar parámetro…', mix: 'Mezcla', volume: 'Volumen', pan: 'Panorama', panStereo: 'Panorama (estéreo, mantiene la anchura)', panL: 'Pan izquierdo', panR: 'Pan derecho', mute: 'Mute (arriba suena, abajo silencio)', sends: 'Envíos', sendN: 'Envío {n}', span: 'Dónde', spanSel: 'Selección / bucle', bars1: '1 comp.', bars2: '2', bars4: '4', bars8: '8',
      spanInfo: '{from} → {to}', fromCursor: '(desde el cursor)', shape: 'Forma', rate: 'Velocidad', feelN: 'Normal', feelT: 'Tresillo', feelD: 'Puntillo',
      sine: 'Seno', triangle: 'Triángulo', square: 'Cuadrada', sawUp: 'Rampa ↑', sawDown: 'Rampa ↓', random: 'Aleatoria', sh: 'S&H', pump: 'Bombeo',
      kMin: 'Mínimo', kMax: 'Máximo', kPhase: 'Fase', kSmooth: 'Suavizado', dice: 'Sorpréndeme', write: 'Escribir automatización', clear: 'Borrar en el rango', undo: 'Deshacer',
      written: '{n} puntos escritos en {p}', cleared: 'Automatización borrada en el rango', undone: 'Deshecho', measuring: 'Midiendo el parámetro…', writing: 'Escribiendo…', failed: 'Error: {e}', noParam: 'Elige un parámetro',
      modeRead: 'He puesto la pista en modo de automatización «read» para que suene.', waiting: 'Esperando a LUNA…', noSession: 'Abre una sesión en LUNA.', report: 'Informe copiado', dark: 'Oscuro', grey: 'Gris', bars: 'comp.' },
    en: { instrument: 'instrument', _name: 'English', target: 'Target:', noTrack: 'Select a track in LUNA', modulated: 'Modulated', search: 'Search parameters…', mix: 'Mixer', volume: 'Volume', pan: 'Pan', panStereo: 'Pan (stereo, keeps the width)', panL: 'Pan left', panR: 'Pan right', mute: 'Mute (high plays, low mutes)', sends: 'Sends', sendN: 'Send {n}', span: 'Where', spanSel: 'Selection / loop', bars1: '1 bar', bars2: '2', bars4: '4', bars8: '8',
      spanInfo: '{from} → {to}', fromCursor: '(from the cursor)', shape: 'Shape', rate: 'Rate', feelN: 'Straight', feelT: 'Triplet', feelD: 'Dotted',
      sine: 'Sine', triangle: 'Triangle', square: 'Square', sawUp: 'Ramp ↑', sawDown: 'Ramp ↓', random: 'Random', sh: 'S&H', pump: 'Pump',
      kMin: 'Minimum', kMax: 'Maximum', kPhase: 'Phase', kSmooth: 'Smooth', dice: 'Surprise me', write: 'Write automation', clear: 'Clear in range', undo: 'Undo',
      written: '{n} points written to {p}', cleared: 'Automation cleared in the range', undone: 'Undone', measuring: 'Measuring the parameter…', writing: 'Writing…', failed: 'Error: {e}', noParam: 'Pick a parameter',
      modeRead: 'I set the track to "read" automation so you hear it.', waiting: 'Waiting for LUNA…', noSession: 'Open a session in LUNA.', report: 'Report copied', dark: 'Dark', grey: 'Grey', bars: 'bars' },
    ca: {"instrument": "instrument", "_name": "Català", "target": "Destí:", "noTrack": "Selecciona una pista a LUNA", "modulated": "Modulats", "search": "Cerca un paràmetre…", "mix": "Mescla", "volume": "Volum", "pan": "Panorama", "panStereo": "Panorama (estèreo, manté l’amplada)", "panL": "Pan esquerre", "panR": "Pan dret", "mute": "Mute (dalt sona, baix silenci)", "sends": "Enviaments", "sendN": "Enviament {n}", "span": "On", "spanSel": "Selecció / bucle", "bars1": "1 comp.", "fromCursor": "(des del cursor)", "shape": "Forma", "rate": "Velocitat", "feelN": "Normal", "feelT": "Treset", "feelD": "Amb punt", "sine": "Sinus", "triangle": "Triangle", "square": "Quadrada", "sawUp": "Rampa ↑", "sawDown": "Rampa ↓", "random": "Aleatòria", "sh": "S&H", "pump": "Bombeig", "kMin": "Mínim", "kMax": "Màxim", "kPhase": "Fase", "kSmooth": "Suavitzat", "dice": "Sorprèn-me", "write": "Escriu l’automatització", "clear": "Esborra al rang", "undo": "Desfés", "written": "{n} punts escrits a {p}", "cleared": "Automatització esborrada al rang", "undone": "Desfet", "measuring": "Mesurant el paràmetre…", "writing": "Escrivint…", "failed": "Error: {e}", "noParam": "Tria un paràmetre", "modeRead": "He posat la pista en mode d’automatització «read» perquè soni.", "waiting": "Esperant LUNA…", "noSession": "Obre una sessió a LUNA.", "report": "Informe copiat", "dark": "Fosc", "grey": "Gris", "bars": "comp."},
    fr: {"instrument": "instrument", "_name": "Français", "target": "Cible :", "noTrack": "Sélectionnez une piste dans LUNA", "modulated": "Modulés", "search": "Rechercher un paramètre…", "mix": "Mixage", "volume": "Volume", "pan": "Panoramique", "panStereo": "Panoramique (stéréo, garde la largeur)", "panL": "Pan gauche", "panR": "Pan droit", "mute": "Mute (haut : joue, bas : coupé)", "sends": "Départs", "sendN": "Départ {n}", "span": "Où", "spanSel": "Sélection / boucle", "bars1": "1 mesure", "fromCursor": "(depuis le curseur)", "shape": "Forme", "rate": "Vitesse", "feelN": "Normal", "feelT": "Triolet", "feelD": "Pointé", "sine": "Sinus", "triangle": "Triangle", "square": "Carré", "sawUp": "Rampe ↑", "sawDown": "Rampe ↓", "random": "Aléatoire", "sh": "S&H", "pump": "Pompage", "kMin": "Minimum", "kMax": "Maximum", "kPhase": "Phase", "kSmooth": "Lissage", "dice": "Surprends-moi", "write": "Écrire l’automation", "clear": "Effacer dans la zone", "undo": "Annuler", "written": "{n} points écrits sur {p}", "cleared": "Automation effacée dans la zone", "undone": "Annulé", "measuring": "Mesure du paramètre…", "writing": "Écriture…", "failed": "Erreur : {e}", "noParam": "Choisissez un paramètre", "modeRead": "J’ai mis la piste en automation « read » pour l’entendre.", "waiting": "En attente de LUNA…", "noSession": "Ouvrez une session dans LUNA.", "report": "Rapport copié", "dark": "Sombre", "grey": "Gris", "bars": "mesures"},
    de: {"instrument": "Instrument", "_name": "Deutsch", "target": "Ziel:", "noTrack": "Wähle eine Spur in LUNA", "modulated": "Moduliert", "search": "Parameter suchen…", "mix": "Mixer", "volume": "Lautstärke", "pan": "Panorama", "panStereo": "Panorama (Stereo, behält die Breite)", "panL": "Pan links", "panR": "Pan rechts", "mute": "Mute (oben spielt, unten stumm)", "sends": "Sends", "sendN": "Send {n}", "span": "Wo", "spanSel": "Auswahl / Loop", "bars1": "1 Takt", "fromCursor": "(ab dem Cursor)", "shape": "Form", "rate": "Rate", "feelN": "Gerade", "feelT": "Triole", "feelD": "Punktiert", "sine": "Sinus", "triangle": "Dreieck", "square": "Rechteck", "sawUp": "Rampe ↑", "sawDown": "Rampe ↓", "random": "Zufall", "sh": "S&H", "pump": "Pumpen", "kMin": "Minimum", "kMax": "Maximum", "kPhase": "Phase", "kSmooth": "Glättung", "dice": "Überrasch mich", "write": "Automation schreiben", "clear": "Im Bereich löschen", "undo": "Rückgängig", "written": "{n} Punkte in {p} geschrieben", "cleared": "Automation im Bereich gelöscht", "undone": "Rückgängig gemacht", "measuring": "Parameter wird gemessen…", "writing": "Schreibe…", "failed": "Fehler: {e}", "noParam": "Wähle einen Parameter", "modeRead": "Ich habe die Spur auf „read“-Automation gestellt, damit du sie hörst.", "waiting": "Warte auf LUNA…", "noSession": "Öffne eine Session in LUNA.", "report": "Bericht kopiert", "dark": "Dunkel", "grey": "Grau", "bars": "Takte"},
    it: {"instrument": "strumento", "_name": "Italiano", "target": "Destinazione:", "noTrack": "Seleziona una traccia in LUNA", "modulated": "Modulati", "search": "Cerca parametro…", "mix": "Mixer", "volume": "Volume", "pan": "Panorama", "panStereo": "Panorama (stereo, mantiene l’ampiezza)", "panL": "Pan sinistro", "panR": "Pan destro", "mute": "Mute (alto suona, basso muto)", "sends": "Mandate", "sendN": "Mandata {n}", "span": "Dove", "spanSel": "Selezione / loop", "bars1": "1 battuta", "fromCursor": "(dal cursore)", "shape": "Forma", "rate": "Velocità", "feelN": "Normale", "feelT": "Terzina", "feelD": "Puntato", "sine": "Seno", "triangle": "Triangolo", "square": "Quadra", "sawUp": "Rampa ↑", "sawDown": "Rampa ↓", "random": "Casuale", "sh": "S&H", "pump": "Pompaggio", "kMin": "Minimo", "kMax": "Massimo", "kPhase": "Fase", "kSmooth": "Ammorbidimento", "dice": "Sorprendimi", "write": "Scrivi automazione", "clear": "Cancella nell’intervallo", "undo": "Annulla", "written": "{n} punti scritti su {p}", "cleared": "Automazione cancellata nell’intervallo", "undone": "Annullato", "measuring": "Misuro il parametro…", "writing": "Scrittura…", "failed": "Errore: {e}", "noParam": "Scegli un parametro", "modeRead": "Ho messo la traccia in automazione «read» perché si senta.", "waiting": "In attesa di LUNA…", "noSession": "Apri una sessione in LUNA.", "report": "Rapporto copiato", "dark": "Scuro", "grey": "Grigio", "bars": "battute"},
    pt: {"instrument": "instrumento", "_name": "Português", "target": "Destino:", "noTrack": "Seleciona uma faixa no LUNA", "modulated": "Modulados", "search": "Procurar parâmetro…", "mix": "Mistura", "volume": "Volume", "pan": "Panorama", "panStereo": "Panorama (estéreo, mantém a largura)", "panL": "Pan esquerdo", "panR": "Pan direito", "mute": "Mute (em cima toca, em baixo silêncio)", "sends": "Envios", "sendN": "Envio {n}", "span": "Onde", "spanSel": "Seleção / loop", "bars1": "1 compasso", "fromCursor": "(a partir do cursor)", "shape": "Forma", "rate": "Velocidade", "feelN": "Normal", "feelT": "Tercina", "feelD": "Pontuado", "sine": "Seno", "triangle": "Triângulo", "square": "Quadrada", "sawUp": "Rampa ↑", "sawDown": "Rampa ↓", "random": "Aleatória", "sh": "S&H", "pump": "Bombeamento", "kMin": "Mínimo", "kMax": "Máximo", "kPhase": "Fase", "kSmooth": "Suavização", "dice": "Surpreende-me", "write": "Escrever automação", "clear": "Apagar no intervalo", "undo": "Desfazer", "written": "{n} pontos escritos em {p}", "cleared": "Automação apagada no intervalo", "undone": "Desfeito", "measuring": "A medir o parâmetro…", "writing": "A escrever…", "failed": "Erro: {e}", "noParam": "Escolhe um parâmetro", "modeRead": "Pus a faixa em automação «read» para se ouvir.", "waiting": "À espera do LUNA…", "noSession": "Abre uma sessão no LUNA.", "report": "Relatório copiado", "dark": "Escuro", "grey": "Cinzento", "bars": "compassos"},
  };
  for (const [c, v] of Object.entries({"es": "Este parámetro va por pasos ({n} posiciones): la curva salta de una a otra", "en": "This parameter has steps ({n} positions): the curve jumps between them", "ca": "Aquest paràmetre va per passos ({n} posicions): la corba salta d’una a l’altra", "fr": "Ce paramètre est à crans ({n} positions) : la courbe saute de l’une à l’autre", "de": "Dieser Parameter hat Stufen ({n} Stellungen): die Kurve springt zwischen ihnen", "it": "Questo parametro va a scatti ({n} posizioni): la curva salta dall’una all’altra", "pt": "Este parâmetro funciona por passos ({n} posições): a curva salta entre elas"})) if (I18N[c]) I18N[c].stepNote = v;
  let lang = store.get('lang') ?? (() => { for (const l of navigator.languages ?? [navigator.language]) { const c = String(l || '').slice(0, 2).toLowerCase(); if (I18N[c]) return c; } return 'en'; })();
  const t = (k, v = {}) => String(I18N[lang][k] ?? I18N.en[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => (x in v ? String(v[x]) : m));

  // The guide: its texts, in every language.
  for (const [c, v] of Object.entries({"en": {"help": "Quick guide", "helpBtn": "Guide", "tNext": "Next", "tBack": "Back", "tSkip": "Skip", "tDone": "Got it", "langT": "Choose your language", "langX": "The guide and the whole window will use it. You can change it later here, at the top right.", "zt": "Always at hand", "z": "Open this guide again whenever you need it with the Guide button.", "q1t": "What to move", "q1": "Select a track in LUNA, then pick the parameter: volume, pan, mute, sends or any plug-in parameter. Those already automated stay at the top.", "q2t": "Where, and a preview", "q2": "Write over the selection or loop, or 1 to 8 bars from the cursor. The curve is drawn over the bars, with the existing automation faintly behind.", "q3t": "Shape and rate", "q3": "Eight shapes, a rate locked to the tempo (straight, triplet or dotted), the range it travels and the phase. Surprise me rolls a new combination.", "q4t": "Write it", "q4": "Write automation puts it on the track and sets it to read, so you hear it straight away. Clear in range removes it; Undo reverts."}, "es": {"help": "Guía rápida", "helpBtn": "Guía", "tNext": "Siguiente", "tBack": "Atrás", "tSkip": "Saltar", "tDone": "Entendido", "langT": "Elige tu idioma", "langX": "La guía y toda la ventana lo usarán. Puedes cambiarlo luego aquí, arriba a la derecha.", "zt": "Siempre a mano", "z": "Vuelve a esta guía cuando la necesites con el botón Guía.", "q1t": "Qué mover", "q1": "Selecciona una pista en LUNA y elige el parámetro: volumen, panorama, mute, envíos o cualquier parámetro de un plugin. Los que ya tienen automatización quedan arriba.", "q2t": "Dónde, con vista previa", "q2": "Escribe sobre la selección o el loop, o de 1 a 8 compases desde el cursor. La curva se dibuja sobre los compases, con la automatización que ya hay detrás, en tenue.", "q3t": "Forma y velocidad", "q3": "Ocho formas, una velocidad atada al tempo (normal, tresillo o con puntillo), el rango que recorre y la fase. Sorpréndeme prueba una combinación nueva.", "q4t": "Escríbela", "q4": "Escribir automatización la pone en la pista y la deja en lectura para que la oigas al momento. Borrar en el rango la quita; Deshacer la revierte."}, "ca": {"help": "Guia ràpida", "helpBtn": "Guia", "tNext": "Següent", "tBack": "Enrere", "tSkip": "Saltar", "tDone": "Entesos", "langT": "Tria el teu idioma", "langX": "La guia i tota la finestra el faran servir. El pots canviar després aquí, a dalt a la dreta.", "zt": "Sempre a mà", "z": "Torna a aquesta guia quan la necessitis amb el botó Guia.", "q1t": "Què moure", "q1": "Selecciona una pista a LUNA i tria el paràmetre: volum, panorama, mute, envios o qualsevol paràmetre d’un plugin. Els que ja tenen automatització queden a dalt.", "q2t": "On, amb previsualització", "q2": "Escriu sobre la selecció o el loop, o d’1 a 8 compassos des del cursor. La corba es dibuixa sobre els compassos, amb l’automatització que ja hi ha al darrere, tènue.", "q3t": "Forma i velocitat", "q3": "Vuit formes, una velocitat lligada al tempo (normal, tresset o amb punt), el rang que recorre i la fase. Sorprèn-me prova una combinació nova.", "q4t": "Escriu-la", "q4": "Escriu l’automatització la posa a la pista i la deixa en lectura perquè la sentis al moment. Esborra al rang la treu; Desfés la reverteix."}, "fr": {"help": "Guide rapide", "helpBtn": "Guide", "tNext": "Suivant", "tBack": "Retour", "tSkip": "Passer", "tDone": "Compris", "langT": "Choisissez votre langue", "langX": "Le guide et toute la fenêtre l’utiliseront. Vous pourrez la changer ici, en haut à droite.", "zt": "Toujours à portée", "z": "Rouvrez ce guide quand vous voulez avec le bouton Guide.", "q1t": "Quoi moduler", "q1": "Sélectionnez une piste dans LUNA, puis choisissez le paramètre : volume, pan, mute, envois ou n’importe quel paramètre de plug-in. Ceux déjà automatisés restent en haut.", "q2t": "Où, avec aperçu", "q2": "Écrivez sur la sélection ou la boucle, ou sur 1 à 8 mesures depuis le curseur. La courbe est dessinée sur les mesures, avec l’automation existante en transparence.", "q3t": "Forme et vitesse", "q3": "Huit formes, une vitesse calée sur le tempo (normale, triolet ou pointée), la plage parcourue et la phase. Surprends-moi tire une nouvelle combinaison.", "q4t": "Écrivez-la", "q4": "Écrire l’automation la pose sur la piste et la met en lecture pour l’entendre tout de suite. Effacer dans la zone la retire ; Annuler revient en arrière."}, "de": {"help": "Kurzanleitung", "helpBtn": "Anleitung", "tNext": "Weiter", "tBack": "Zurück", "tSkip": "Überspringen", "tDone": "Verstanden", "langT": "Wähle deine Sprache", "langX": "Die Anleitung und das ganze Fenster verwenden sie. Du kannst sie später hier oben rechts ändern.", "zt": "Immer zur Hand", "z": "Öffne diese Anleitung jederzeit wieder mit dem Button Anleitung.", "q1t": "Was sich bewegt", "q1": "Wähle in LUNA eine Spur und dann den Parameter: Lautstärke, Panorama, Mute, Sends oder jeden Plug-in-Parameter. Bereits automatisierte stehen oben.", "q2t": "Wo, mit Vorschau", "q2": "Schreib über die Auswahl oder den Loop, oder 1 bis 8 Takte ab dem Cursor. Die Kurve wird über die Takte gezeichnet, die vorhandene Automation blass dahinter.", "q3t": "Form und Tempo", "q3": "Acht Formen, ein ans Tempo gebundenes Tempo (gerade, triolisch oder punktiert), der Bereich und die Phase. Überrasch mich würfelt eine neue Kombination.", "q4t": "Schreiben", "q4": "Automation schreiben legt sie auf die Spur und schaltet auf Lesen, damit du sie sofort hörst. Im Bereich löschen entfernt sie; Rückgängig nimmt sie zurück."}, "it": {"help": "Guida rapida", "helpBtn": "Guida", "tNext": "Avanti", "tBack": "Indietro", "tSkip": "Salta", "tDone": "Capito", "langT": "Scegli la tua lingua", "langX": "La guida e tutta la finestra la useranno. Puoi cambiarla poi qui, in alto a destra.", "zt": "Sempre a portata di mano", "z": "Riapri questa guida quando ti serve con il pulsante Guida.", "q1t": "Cosa muovere", "q1": "Seleziona una traccia in LUNA e scegli il parametro: volume, pan, mute, mandate o qualsiasi parametro di un plug-in. Quelli già automatizzati restano in cima.", "q2t": "Dove, con anteprima", "q2": "Scrivi sulla selezione o sul loop, o da 1 a 8 battute dal cursore. La curva è disegnata sulle battute, con l’automazione esistente in trasparenza dietro.", "q3t": "Forma e velocità", "q3": "Otto forme, una velocità legata al tempo (normale, terzina o puntata), l’escursione e la fase. Sorprendimi tira fuori una combinazione nuova.", "q4t": "Scrivila", "q4": "Scrivi automazione la mette sulla traccia e la imposta in lettura, così la senti subito. Cancella nell’intervallo la toglie; Annulla torna indietro."}, "pt": {"help": "Guia rápido", "helpBtn": "Guia", "tNext": "Seguinte", "tBack": "Voltar", "tSkip": "Saltar", "tDone": "Percebi", "langT": "Escolhe o teu idioma", "langX": "O guia e toda a janela vão usá-lo. Podes mudá-lo depois aqui, em cima à direita.", "zt": "Sempre à mão", "z": "Volta a este guia quando precisares com o botão Guia.", "q1t": "O que mexer", "q1": "Seleciona uma faixa no LUNA e escolhe o parâmetro: volume, pan, mute, envios ou qualquer parâmetro de um plugin. Os que já têm automação ficam em cima.", "q2t": "Onde, com pré-visualização", "q2": "Escreve sobre a seleção ou o loop, ou de 1 a 8 compassos a partir do cursor. A curva é desenhada sobre os compassos, com a automação existente esbatida por trás.", "q3t": "Forma e velocidade", "q3": "Oito formas, uma velocidade presa ao tempo (normal, tercina ou pontuada), o intervalo que percorre e a fase. Surpreende-me tira uma combinação nova.", "q4t": "Escreve-a", "q4": "Escrever automação põe-na na faixa e deixa-a em leitura para a ouvires logo. Apagar no intervalo retira-a; Desfazer reverte."}})) Object.assign(I18N[c], v);
  let tour = null;
  let theme = store.get('theme') === 'grey' ? 'grey' : 'dark';
  let statusTimer;
  const say = (key, vars = {}, kind = '', ms = 0) => { clearTimeout(statusTimer); $('status').textContent = key ? t(key, vars) : ''; $('status').className = `status ${kind}`; if (ms) statusTimer = setTimeout(() => say(null), ms); };
  const log = [];
  const note = (what, extra = {}) => { log.push({ t: new Date().toISOString().slice(11, 23), what, ...extra }); if (log.length > 200) log.shift(); };
  const errText = (e) => String(e?.message || e);

  // ---- Settings ---------------------------------------------------------------------------------
  const SHAPES = ['sine', 'triangle', 'square', 'sawUp', 'sawDown', 'random', 'sh', 'pump'];
  const RATES = ['4', '2', '1', '1/2', '1/4', '1/8', '1/16', '1/32'];
  const opts = { shape: 'sine', rate: '1/4', feel: 'n', min: 20, max: 80, phase: 0, smooth: 50, seed: 1, span: 'sel', ...(store.get('opts') ?? {}) };
  const save = () => store.set('opts', opts);
  const ICON = {
    sine: 'M2 10C6 1 10 1 14 10S22 19 26 10S34 1 38 10', triangle: 'M2 18L11 2L20 18L29 2L38 18', square: 'M2 18V3H12V18H22V3H32V18H38',
    sawUp: 'M2 18L14 3V18L26 3V18L38 3', sawDown: 'M2 3L14 18V3L26 18V3L38 18', random: 'M2 12C5 4 8 4 10 9S15 18 18 13S23 2 27 7S33 16 38 9',
    sh: 'M2 12H8V5H14V15H20V8H26V17H32V6H38', pump: 'M2 18C4 6 8 3 14 3V18C16 6 20 3 26 3V18C28 6 32 3 38 3',
  };

  // ---- The shape -------------------------------------------------------------------------------------
  // A small seeded random, so the same seed gives the same random curve.
  const rnd = (n) => { let x = Math.imul((n + opts.seed * 7919) | 0, 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
  // Value 0..1 of the shape at cycle `k`, fraction x (0..1).
  function shapeAt(k, x) {
    switch (opts.shape) {
      case 'sine': return 0.5 - 0.5 * Math.cos(2 * Math.PI * x);
      case 'triangle': return x < 0.5 ? 2 * x : 2 - 2 * x;
      case 'square': { const e = (opts.smooth / 100) * 0.12; if (x < 0.5 - e) return 1; if (x < 0.5) return (0.5 - x) / (e || 1); if (x < 1 - e) return 0; return (x - (1 - e)) / (e || 1); }
      case 'sawUp': return x;
      case 'sawDown': return 1 - x;
      case 'random': { const a = rnd(k), b = rnd(k + 1), s = 0.5 - 0.5 * Math.cos(Math.PI * x); return a + (b - a) * s; }
      case 'sh': return rnd(k);
      case 'pump': { const c = 2 + (opts.smooth / 100) * 8; return (1 - Math.exp(-c * x)) / (1 - Math.exp(-c)); }
      default: return 0.5;
    }
  }
  // Where each cycle needs points: enough for smooth curves, two at each jump for hard edges.
  function cycleXs(len, eps) {
    const e = eps / len;
    switch (opts.shape) {
      case 'triangle': return [0, 0.5];
      case 'square': { const s = (opts.smooth / 100) * 0.12; return s ? [0, 0.5 - s, 0.5, 1 - s] : [0, 0.5 - e, 0.5, 1 - e]; }
      case 'sawUp': case 'sawDown': return [0, 1 - e];
      case 'sh': return [0, 1 - e];
      case 'pump': return Array.from({ length: 10 }, (_, i) => Math.min(1 - e, i / 9 * (1 - e)));
      default: return Array.from({ length: 16 }, (_, i) => i / 16);
    }
  }

  // ---- Knobs ---------------------------------------------------------------------------------------------
  function knob(label, value, min, max, fmt, onSet, def) {
    const box = document.createElement('div'); box.className = 'knob';
    box.innerHTML = '<div class="kl"></div><svg viewBox="0 0 40 40"></svg><div class="kv"></div>';
    box.querySelector('.kl').textContent = label;
    const svg = box.querySelector('svg'), kv = box.querySelector('.kv');
    const pt = (deg, r) => { const rad = (deg - 90) * Math.PI / 180; return [20 + r * Math.cos(rad), 20 + r * Math.sin(rad)]; };
    const arc = (from, to) => { const [x1, y1] = pt(from, 15), [x2, y2] = pt(to, 15); return `M${x1.toFixed(2)} ${y1.toFixed(2)}A15 15 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`; };
    const paint = () => {
      const frac = (value - min) / (max - min || 1), a = -135 + frac * 270, [px, py] = pt(a, 10);
      svg.innerHTML = `<path d="${arc(-135, 135)}" class="ktrack"/>${frac > 0.001 ? `<path d="${arc(-135, a)}" class="kval"/>` : ''}<line x1="20" y1="20" x2="${px.toFixed(2)}" y2="${py.toFixed(2)}" class="kptr"/>`;
      kv.textContent = fmt(value);
    };
    const set = (v) => { v = Math.max(min, Math.min(max, Math.round(v))); if (v === value) return; value = v; paint(); onSet(v); };
    svg.onpointerdown = (ev) => {
      svg.setPointerCapture(ev.pointerId);
      const y0 = ev.clientY, v0 = value, span = max - min;
      svg.onpointermove = (e) => set(v0 + ((y0 - e.clientY) / 160) * span);
      svg.onpointerup = () => { svg.onpointermove = null; svg.onpointerup = null; };
    };
    svg.onwheel = (ev) => { ev.preventDefault(); set(value + (ev.deltaY < 0 ? 1 : -1) * Math.max(1, Math.round((max - min) / 100))); };
    svg.ondblclick = () => set(def);
    paint();
    return box;
  }

  let redraw = () => {};
  let relabel = () => {};
  const changed = () => { save(); redraw(); };
  function paintControls() {
    $('shapes').replaceChildren(...SHAPES.map((s) => {
      const b = document.createElement('button');
      b.className = `shape${opts.shape === s ? ' on' : ''}`;
      b.innerHTML = `<svg viewBox="0 0 40 20"><path d="${ICON[s]}"/></svg><span></span>`;
      b.querySelector('span').textContent = t(s);
      b.onclick = () => { opts.shape = s; changed(); paintControls(); };
      return b;
    }));
    $('rate').replaceChildren(...RATES.map((r) => Object.assign(document.createElement('option'), { value: r, textContent: r.includes('/') ? r : `${r} ${t('bars')}` })));
    $('rate').value = opts.rate;
    $('feel').replaceChildren(...[['n', 'feelN'], ['t', 'feelT'], ['d', 'feelD']].map(([v, k]) => { const b = Object.assign(document.createElement('button'), { textContent: t(k) }); b.classList.toggle('on', opts.feel === v); b.onclick = () => { opts.feel = v; changed(); paintControls(); }; return b; }));
    const showSmooth = ['square', 'pump'].includes(opts.shape);
    $('knobs').replaceChildren(
      knob(t('kMin'), opts.min, 0, 100, (v) => `${v}%`, (v) => { opts.min = v; changed(); }, 0),
      knob(t('kMax'), opts.max, 0, 100, (v) => `${v}%`, (v) => { opts.max = v; changed(); }, 100),
      knob(t('kPhase'), opts.phase, 0, 359, (v) => `${v}°`, (v) => { opts.phase = v; changed(); }, 0),
      ...(showSmooth ? [knob(t('kSmooth'), opts.smooth, 0, 100, (v) => `${v}%`, (v) => { opts.smooth = v; changed(); }, 50)] : []));
    const spans = [['sel', 'spanSel'], ['1', 'bars1'], ['2', 'bars2'], ['4', 'bars4'], ['8', 'bars8']];
    $('span').replaceChildren(...spans.map(([v, k]) => { const b = Object.assign(document.createElement('button'), { textContent: t(k) }); b.classList.toggle('on', opts.span === v); b.onclick = () => { opts.span = v; changed(); paintControls(); }; return b; }));
  }
  $('rate').onchange = () => { opts.rate = $('rate').value; changed(); };
  $('dice').onclick = () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    opts.shape = pick(SHAPES); opts.rate = pick(['1', '1/2', '1/4', '1/8', '1/16']); opts.feel = pick(['n', 'n', 'n', 't', 'd']);
    const a = Math.round(Math.random() * 40), b = 60 + Math.round(Math.random() * 40);
    opts.min = a; opts.max = b; opts.phase = pick([0, 0, 90, 180, 270]); opts.seed = 1 + Math.floor(Math.random() * 9999);
    changed(); paintControls();
  };
  function paintStatic() {
    document.documentElement.lang = lang;
    $('help').title = t('help'); $('help').setAttribute('aria-label', t('help')); { const q = document.createElement('b'); q.textContent = '?'; const sp = document.createElement('span'); sp.textContent = t('helpBtn'); $('help').replaceChildren(q, sp); }
    document.documentElement.dataset.theme = theme;
    $('ver').textContent = `v${VERSION}`;
    $('lang').replaceChildren(...Object.keys(I18N).map((c) => Object.assign(document.createElement('option'), { value: c, textContent: I18N[c]._name })));
    $('lang').value = lang;
    for (const [id, name] of [['tDark', 'dark'], ['tGrey', 'grey']]) { $(id).classList.toggle('on', theme === name); $(id).title = t(name); }
    $('pickSearch').placeholder = t('search');
    for (const [id, k] of Object.entries({ targetLabel: 'target', spanLabel: 'span', shapeLabel: 'shape', rateLabel: 'rate', write: 'write', clear: 'clear', undo: 'undo' })) $(id).textContent = t(k);
    $('dice').innerHTML = `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.6" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg><span>${t('dice')}</span>`;
    paintControls(); redraw();
  }
  $('lang').onchange = () => { lang = $('lang').value; store.set('lang', lang); paintStatic(); relabel(); };
  for (const b of [$('tDark'), $('tGrey')]) b.onclick = () => { theme = b.dataset.t; store.set('theme', theme); paintStatic(); };
  paintStatic();

  let luna, built;
  async function build() {
    const s = luna.sessions.current();
    if (s === built) return;
    built = s;
    if (!s) { say('noSession'); return; }
    await s.ready();
    if (s !== built) return;
    await s.musical.ready();
    say(null);
    const tr = s.transport, tl = s.musical.timeline, ctx = s.context;
    const TPB = Luna.TICKS_PER_BEAT;
    let busy = false, lastSteps = 0;

    const track = () => {
      const ids = ctx.selectionTracks.value ?? [];
      return ids.map((id) => s.tracks.byId(id)).find(Boolean) ?? s.tracks.byId(ctx.lastSelectedTrack.value) ?? null;
    };
    // The span to write: the selection, else the loop, else bars from the selection start or cursor.
    function span() {
      const S = ctx.selectionStart.value, E = ctx.selectionStop.value;
      const hasSel = typeof S === 'number' && typeof E === 'number' && E > S;
      if (opts.span === 'sel') {
        if (hasSel) return { S, E };
        const L0 = tr.loopStart.value, L1 = tr.loopStop.value;
        if (tr.looping.value && typeof L0 === 'number' && L1 > L0) return { S: L0, E: L1 };
      }
      const from = typeof S === 'number' ? S : (tr.playStart.value ?? 0);
      const bb = tl.barBeat(from);
      const start = tl.tickAtBar(bb.bar);
      const n = opts.span === 'sel' ? 1 : Number(opts.span);
      return { S: start, E: tl.tickAtBar(bb.bar + n), cursor: !hasSel };
    }
    function cycleTicks(at) {
      const feel = opts.feel === 't' ? 2 / 3 : opts.feel === 'd' ? 1.5 : 1;
      if (!opts.rate.includes('/')) { const bar = tl.barBeat(at).bar; return Math.round(((tl.tickAtBar(bar + 1) - tl.tickAtBar(bar)) || 4 * TPB) * Number(opts.rate) * feel); }
      const [, d] = opts.rate.split('/').map(Number);
      return Math.round(4 * TPB / d * feel);
    }
    // Points 0..1 over the span, phase applied, clipped to [S, E] with an end point at each side.
    function points(S, E) {
      const len = cycleTicks(S);
      const eps = Math.max(1, Math.round(len * 0.004));
      const off = Math.round((opts.phase / 360) * len);
      const xs = cycleXs(len, eps);
      const lo = opts.min / 100, hi = opts.max / 100;
      const at = (tick) => { const rel = tick - S + off; const k = Math.floor(rel / len); return lo + (hi - lo) * shapeAt(k, (rel - k * len) / len); };
      const out = [];
      const k0 = Math.floor(off / len) - 1, k1 = Math.ceil((E - S + off) / len) + 1;
      for (let k = k0; k <= k1 && out.length < 6000; k++) {
        for (const x of xs) {
          const tick = Math.round(S - off + k * len + x * len);
          if (tick > S && tick < E) out.push(tick);
        }
      }
      const pts = out.map((tick) => ({ tick, value: at(tick) }));
      pts.unshift({ tick: S, value: at(S) });
      pts.push({ tick: E - 1, value: at(E - 1) });
      pts.sort((a, b) => a.tick - b.tick);
      return pts.filter((p, i) => i === 0 || p.tick !== pts[i - 1].tick);
    }

    // ---- Parameters of the selected track ------------------------------------------------------------
    let params = [];   // [{ key, label, control }]
    let paramTrack = null;
    async function loadParams() {
      const tk = track();
      paramTrack = tk;
      $('trackName').textContent = tk ? tk.name.value : t('noTrack');
      params = [];
      if (tk) {
        // Mixer: volume, pan (one control on mono, a left/right pair on stereo), mute, sends.
        const ctl = (out, name) => { try { return out?.controls?.items?.find((c) => c.name?.value === name || c.controlType?.value === name || c.path?.endsWith(`/${name}`)) ?? null; } catch { return null; } };
        await tk.main?.controls?.load?.().catch(() => undefined);
        const main = tk.main;
        const g = ctl(main, 'gain'); if (g) params.push({ key: 'gain', group: t('mix'), label: t('volume'), control: g });
        const pm = ctl(main, 'pan'), pl = ctl(main, 'pan_left'), pr = ctl(main, 'pan_right');
        if (pm) params.push({ key: 'pan', group: t('mix'), label: t('pan'), control: pm });
        if (pl && pr) {
          params.push({ key: 'panLR', group: t('mix'), label: t('panStereo'), pair: [pl, pr] });
          params.push({ key: 'panL', group: t('mix'), label: t('panL'), control: pl }, { key: 'panR', group: t('mix'), label: t('panR'), control: pr });
        }
        const m = ctl(main, 'mute'); if (m) params.push({ key: 'mute', group: t('mix'), label: t('mute'), control: m, step: true, isMute: true });
        await tk.outputs?.load?.().catch(() => undefined);
        for (const out of tk.outputs?.items ?? []) {
          const id = out.path?.split('/').pop() ?? '';
          if (!/^send_\d+$/.test(id) || out.assigned === false) continue;
          await out.controls?.load?.().catch(() => undefined);
          const sg = ctl(out, 'gain'); const dest = out.destination?.value?.name ?? ''; if (sg) params.push({ key: `send:${id}`, group: t('sends'), label: `${t('sendN', { n: Number(id.slice(5)) + 1 })}${dest ? ` → ${dest}` : ''}`, control: sg });
        }
        // Every plug-in on the track, in every slot that holds one: the instrument first, then the
        // MIDI effects, the inserts, and LUNA's console and tape. (loadedEffects lists only the
        // effect_N inserts, which left instruments out.)
        await tk.effects?.load?.().catch(() => undefined);
        const order = (id) => (id === 'instrument' ? 0 : /^midi_/.test(id) ? 1 : /^effect_/.test(id) ? 2 : 3) * 1000 + (Number(id.replace(/\D+/g, '')) || 0);
        const slots = (tk.effects?.items ?? []).filter((f) => !f.isEmpty && /^(instrument|midi_\d+|effect_\d+|console|tape)$/.test(f.insertType?.value ?? ''))
          .sort((x, y) => order(x.insertType.value ?? '') - order(y.insertType.value ?? ''));
        const slotInfo = [];
        for (const fx of slots) {
          await fx.controls.load().catch(() => undefined);
          const slot = fx.insertType.value ?? '';
          const name = `${fx.pluginName.value || slot}${slot === 'instrument' ? ` (${t('instrument')})` : /^effect_\d+$/.test(slot) ? ` (${Number(slot.slice(7)) + 1})` : ''}`;
          // LUNA lists a plug-in's parameters once it has initialised them; some (seen with a UAD
          // channel strip on Windows) report none until their window has been opened. Then fall
          // back to every control that has a name, so the plug-in is never missing from the list.
          const ready = fx.params, named = (fx.controls?.items ?? []).filter((c) => c.name?.value);
          slotInfo.push(`${slot}:${fx.pluginName.value}:${ready.length}/${named.length}`);
          for (const p of (ready.length ? ready : named)) if (p.automatable.value !== false) params.push({ key: `fx:${slot}:${p.uid.value ?? p.name.value}`, group: name, label: p.name.value, control: p, step: !!p.discrete.value });
        }
        note('params', { track: tk.name.value, n: params.length, effects: slotInfo });
      }
      const want = store.get('param');
      selectedKey = params.some((p) => p.key === want) ? want : (params[0]?.key ?? '');
      $('write').disabled = $('clear').disabled = !params.length;
      renderPicker();
      redraw();
      void scanHand();
      void loadGhost();
    }
    relabel = () => void loadParams();
    const current = () => params.find((p) => p.key === selectedKey) ?? null;

    // ---- What is already modulated -------------------------------------------------------------------
    // What Modulators wrote is kept in the session (track + parameter); hand-drawn automation is
    // read from the lanes of the mixer controls and sends, which are few and quick to read.
    const vstore = s.storage.context('com.fedetrillo.modulators');
    let written = [];   // [{ track, key }]
    const handAuto = new Set();
    async function loadWritten() {
      try { await vstore.load(); written = vstore.value('mod', 'written').value ?? []; } catch (e) { note('storage', { e: errText(e) }); }
    }
    async function saveWritten() {
      try {
        if (vstore.value('mod', 'written').value === undefined) await vstore.add('mod', 'written', written);
        else await vstore.set('mod', 'written', written);
      } catch (e) { note('storage save', { e: errText(e) }); }
    }
    const isWritten = (p) => !!paramTrack && written.some((w) => w.track === paramTrack.id && w.key === p.key);
    const isModulated = (p) => isWritten(p) || handAuto.has(p.key);
    async function markWritten(p, on) {
      if (!paramTrack) return;
      written = written.filter((w) => !(w.track === paramTrack.id && w.key === p.key));
      if (on) written.push({ track: paramTrack.id, key: p.key });
      await saveWritten();
    }
    async function laneHasPoints(c) { try { await c.automation.load?.(); return (c.automation.breakpoints ?? []).length > 0; } catch { return false; } }
    async function scanHand() {
      handAuto.clear();
      for (const p of params) {
        if (p.key.startsWith('fx:')) continue;
        const cs = p.pair ?? [p.control];
        for (const c of cs) if (await laneHasPoints(c)) { handAuto.add(p.key); break; }
      }
      renderPicker();
    }

    // ---- The parameter picker: the mixer always in view, sends and each plug-in folded ------------
    let selectedKey = '';
    const openGroups = new Set();
    const pick = (key) => { selectedKey = key; store.set('param', key); closePicker(); renderPicker(); redraw(); void loadGhost(); };
    // The add-on's colour says what is being modulated: violet and pink for the mixer, blues for
    // sends, greens for plug-in parameters.
    const kindOf = (p) => (!p ? 'mix' : p.key.startsWith('send:') ? 'send' : p.key.startsWith('fx:') ? 'fx' : 'mix');
    function tint() { document.documentElement.dataset.kind = kindOf(current()); }
    function pickLabel(p) { return p ? (p.group === t('mix') ? p.label : `${p.group} · ${p.label}`) : t('noParam'); }
    function renderPicker() {
      const cur = current();
      $('pickLabel').textContent = pickLabel(cur);
      $('pickBtn').classList.toggle('mod', !!cur && isModulated(cur));
      tint();
      const q = $('pickSearch').value.trim().toLowerCase();
      const groups = new Map();
      for (const p of params) { if (q && !`${p.group} ${p.label}`.toLowerCase().includes(q)) continue; if (!groups.has(p.group)) groups.set(p.group, []); groups.get(p.group).push(p); }
      const list = $('pickList');
      const kids = [];
      const WAVE = '<svg class="wv" viewBox="0 0 16 10"><path d="M1 5C3 0 5 0 7 5S11 10 13 5"/></svg>';
      const item = (p, cls) => {
        const b = document.createElement('button');
        const mod = isModulated(p);
        b.className = `item ${cls}${p.key === selectedKey ? ' on' : ''}${mod ? ` mod k-${kindOf(p)}` : ''}`;
        b.innerHTML = `${isWritten(p) ? WAVE : ''}<span></span>`;
        b.querySelector('span').textContent = cls === 'top' ? pickLabel(p) : p.label;
        b.onclick = () => pick(p.key);
        return b;
      };
      // Everything already modulated, always in view.
      const mods = params.filter((p) => isModulated(p) && (!q || `${p.group} ${p.label}`.toLowerCase().includes(q)));
      if (mods.length) {
        const d = document.createElement('div'); d.className = 'ghead'; d.innerHTML = `${WAVE}<span></span>`; d.querySelector('span').textContent = t('modulated');
        kids.push(d, ...mods.map((p) => item(p, 'top')), Object.assign(document.createElement('div'), { className: 'sep' }));
      }
      for (const [g, items] of groups) {
        const fixed = g === t('mix');
        const open = fixed || !!q || openGroups.has(g);
        if (!fixed) {
          const n = items.filter(isModulated).length;
          const h = document.createElement('button');
          h.className = `grp${open ? ' open' : ''}${items.some((p) => p.key === selectedKey) ? ' has' : ''}`;
          h.innerHTML = `<svg viewBox="0 0 12 12"><path d="M4 2.5L7.5 6L4 9.5"/></svg><i class="kdot ${kindOf(items[0])}"></i><span></span>${n ? `<b class="modn k-${kindOf(items[0])}">${WAVE}${n}</b>` : ''}<em></em>`;
          h.querySelector('span').textContent = g;
          h.querySelector('em').textContent = String(items.length);
          h.onclick = () => { if (openGroups.has(g)) openGroups.delete(g); else openGroups.add(g); renderPicker(); };
          kids.push(h);
        } else {
          const d = document.createElement('div'); d.className = 'ghead'; d.innerHTML = '<i class="kdot mix"></i><span></span>'; d.querySelector('span').textContent = g; kids.push(d);
        }
        if (open) for (const p of items) kids.push(item(p, fixed ? '' : 'sub'));
      }
      list.replaceChildren(...kids);
    }
    function openPicker() {
      const cur = current();
      if (cur && cur.group !== t('mix')) openGroups.add(cur.group);
      $('pop').hidden = false; $('pickBtn').classList.add('open');
      $('pickSearch').value = ''; renderPicker();
      setTimeout(() => $('pickSearch').focus(), 0);
    }
    function closePicker() { $('pop').hidden = true; $('pickBtn').classList.remove('open'); }
    $('pickBtn').onclick = () => ($('pop').hidden ? openPicker() : closePicker());
    $('pickSearch').oninput = () => renderPicker();
    $('pickSearch').onkeydown = (e) => { if (e.key === 'Escape') closePicker(); if (e.key === 'Enter') { const first = $('pickList').querySelector('.item'); if (first) first.click(); } };
    document.addEventListener('pointerdown', (e) => { if (!$('pop').hidden && !e.target.closest?.('#picker')) closePicker(); });

    // ---- The automation already there, drawn faintly behind the new curve ------------------------------
    let ghost = null;   // [{ tick, value 0..1 }]
    async function loadGhost() {
      ghost = null;
      const p = current();
      if (!p) { redraw(); return; }
      const c = p.pair ? p.pair[0] : p.control;
      try {
        await c.automation.load?.();
        const bps = c.automation.breakpoints ?? [];
        if (bps.length) {
          const tab = tables.get(c.path ?? c.uid.value);
          const fromNative = (v) => { if (!tab) return null; for (let i = 1; i < tab.length; i++) { const [n0, v0] = tab[i - 1], [n1, v1] = tab[i]; if ((v - v0) * (v - v1) <= 0 && v1 !== v0) return n0 + ((v - v0) * (n1 - n0)) / (v1 - v0); } return v <= tab[0][1] ? 0 : 1; };
          let mapped = bps.map((b) => ({ tick: b.tick, value: fromNative(b.value) }));
          if (mapped.some((m) => m.value === null)) {
            // Not measured yet: show its shape scaled to its own range.
            const vs = bps.map((b) => b.value), lo = Math.min(...vs), hi = Math.max(...vs);
            mapped = bps.map((b) => ({ tick: b.tick, value: hi > lo ? (b.value - lo) / (hi - lo) : 0.5 }));
          }
          ghost = mapped;
        }
      } catch { ghost = null; }
      redraw();
    }

    // ---- Drawing ---------------------------------------------------------------------------------------
    redraw = () => {
      const { S, E, cursor } = span();
      $('spanInfo').textContent = `${t('spanInfo', { from: tl.formatBarBeat(S), to: tl.formatBarBeat(E) })}${cursor && opts.span !== 'sel' ? ` ${t('fromCursor')}` : ''}`;
      const W = 1000, H = 190, top = 14, bot = H - 16;
      const X = (tick) => ((tick - S) / (E - S || 1)) * W, Y = (v) => bot - v * (bot - top);
      const parts = ['<defs><linearGradient id="gline" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--acc)"/><stop offset="1" stop-color="var(--acc2)"/></linearGradient><linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--acc)" stop-opacity=".35"/><stop offset="1" stop-color="var(--acc2)" stop-opacity=".02"/></linearGradient></defs>'];
      // Bars and beats.
      const b0 = tl.barBeat(S).bar, b1 = tl.barBeat(E).bar + 1;
      for (let b = b0; b <= b1; b++) {
        const bt = tl.tickAtBar(b);
        if (bt >= S && bt <= E) parts.push(`<line class="bar" x1="${X(bt)}" x2="${X(bt)}" y1="${top}" y2="${bot}"/><text class="lab" x="${X(bt) + 4}" y="${H - 3}">${b}</text>`);
        const next = tl.tickAtBar(b + 1);
        for (let q = bt + TPB; q < next; q += TPB) if (q > S && q < E) parts.push(`<line class="beat" x1="${X(q)}" x2="${X(q)}" y1="${top}" y2="${bot}"/>`);
      }
      const lo = opts.min / 100, hi = opts.max / 100;
      parts.push(`<rect class="band" x="0" y="${Y(Math.max(lo, hi))}" width="${W}" height="${Math.abs(Y(lo) - Y(hi))}"/>`);
      parts.push(`<line class="lim" x1="0" x2="${W}" y1="${Y(hi)}" y2="${Y(hi)}"/><line class="lim" x1="0" x2="${W}" y1="${Y(lo)}" y2="${Y(lo)}"/>`);
      const cp = current?.();
      const pts = cp?.step ? stepped(S, E, Math.max(2, Math.min(33, cp.control.numSteps?.value || 2)), false) : points(S, E);
      { const sn = $('stepNote'), ns = cp?.step && !cp.isMute ? Math.max(2, Math.min(33, cp.control.numSteps?.value || 2)) : 0; sn.hidden = !ns; if (ns) { sn.textContent = t('stepNote', { n: ns }); sn.title = sn.textContent; } }
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.tick).toFixed(1)} ${Y(p.value).toFixed(1)}`).join('');
      if (ghost && ghost.length) {
        const g = ghost.filter((q) => q.tick >= S - (E - S) && q.tick <= E + (E - S));
        if (g.length) parts.push(`<path class="ghost" d="${g.map((q, i) => `${i ? 'L' : 'M'}${X(q.tick).toFixed(1)} ${Y(q.value).toFixed(1)}`).join('')}"/>`);
      }
      parts.push(`<path class="fill" d="${d}L${W} ${bot}L0 ${bot}Z"/><path class="line" d="${d}"/>`);
      if (pts.length < 160) parts.push(...pts.map((p) => `<circle class="pt" cx="${X(p.tick).toFixed(1)}" cy="${Y(p.value).toFixed(1)}" r="2.2"/>`));
      const svg = $('wave');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = parts.join('');
    };

    // ---- Native values -------------------------------------------------------------------------------
    // Measure normalized → native once per control: write 0..1 in steps, read the native value back,
    // and put the original value back.
    const tables = new Map();
    async function tableFor(c) {
      const id = c.path ?? c.uid.value;
      if (tables.has(id)) return tables.get(id);
      say('measuring');
      const orig = c.normalized.value;
      const table = [];
      const readAfter = async (n) => {
        const before = c.value.value;
        await c.normalized.set(n);
        for (let i = 0; i < 25; i++) { if (Math.abs((c.normalized.value ?? -1) - n) < 1e-4 && c.value.value !== before) break; await new Promise((r) => setTimeout(r, 20)); }
        return c.value.value;
      };
      const steps = c.discrete?.value ? Math.max(2, Math.min(33, c.numSteps?.value || 2)) : 17;
      for (let i = 0; i < steps; i++) { const n = i / (steps - 1); table.push([n, await readAfter(n)]); }
      if (typeof orig === 'number') await c.normalized.set(orig).catch(() => undefined);
      // A control that reports no native value of its own is automated in 0..1.
      const flat = table.every(([, v]) => typeof v !== 'number') || table.every(([, v]) => v === table[0][1]);
      const tab = flat ? table.map(([n]) => [n, n]) : table;
      tables.set(id, tab);
      note('table', { name: c.name.value, table: tab.map(([n, v]) => `${n.toFixed(2)}:${typeof v === 'number' ? v.toFixed(3) : v}`) });
      return tab;
    }
    const toNative = (tab, n) => {
      for (let i = 1; i < tab.length; i++) if (n <= tab[i][0]) { const [n0, v0] = tab[i - 1], [n1, v1] = tab[i]; return v0 + ((v1 - v0) * (n - n0)) / (n1 - n0 || 1); }
      return tab.at(-1)[1];
    };

    // Hard steps for switches (mute) and stepped plug-in parameters: the curve picks a step, and
    // each change is a jump, one tick wide.
    function stepped(S, E, steps, invert) {
      const fine = points(S, E);
      const len = cycleTicks(S), n = Math.max(64, Math.round((E - S) / len) * 64);
      const pick = (v) => Math.round((invert ? 1 - v : v) * (steps - 1)) / (steps - 1);
      const vAt = (tick) => { for (let i = 1; i < fine.length; i++) if (tick <= fine[i].tick) { const a = fine[i - 1], b = fine[i]; return a.value + (b.value - a.value) * ((tick - a.tick) / (b.tick - a.tick || 1)); } return fine.at(-1).value; };
      const out = [{ tick: S, value: pick(vAt(S)) }];
      for (let i = 1; i <= n; i++) {
        const tick = Math.round(S + ((E - 1 - S) * i) / n), v = pick(vAt(tick)), last = out.at(-1).value;
        if (v !== last) { out.push({ tick: Math.max(out.at(-1).tick + 1, tick - 1), value: last }, { tick, value: v }); }
      }
      out.push({ tick: E - 1, value: out.at(-1).value });
      return out.filter((p, i) => i === 0 || p.tick > out[i - 1].tick);
    }
    async function writeLane(control, pts01) {
      const tab = await tableFor(control);
      const pts = pts01.map((q) => ({ tick: q.tick, value: toNative(tab, q.value) }));
      const lane = control.automation;
      await lane.load?.();
      const { S, E } = span();
      await lane.insert(pts, { startTick: S, stopTick: E });
      return pts.length;
    }
    async function write() {
      const p = current();
      if (!p || busy) { if (!p) say('noParam', {}, 'bad', 3000); return; }
      busy = true; $('write').disabled = true;
      try {
        const { S, E } = span();
        let n = 0;
        if (p.pair) {
          // Stereo pan: move both sides together and keep the width the track has now.
          const [L, R] = p.pair;
          const w = Math.abs((R.normalized.value ?? 1) - (L.normalized.value ?? 0)) / 2;
          const base = points(S, E);
          const clamp = (v) => Math.max(0, Math.min(1, v));
          const lo = (L.normalized.value ?? 0) <= (R.normalized.value ?? 1);
          n += await writeLane(L, base.map((q) => ({ tick: q.tick, value: clamp(lo ? q.value - w : q.value + w) })));
          n += await writeLane(R, base.map((q) => ({ tick: q.tick, value: clamp(lo ? q.value + w : q.value - w) })));
          lastSteps = 2;
        } else {
          say('writing');
          const steps = p.step ? Math.max(2, Math.min(33, p.control.numSteps?.value || 2)) : 0;
          n = await writeLane(p.control, steps ? stepped(S, E, steps, !!p.isMute) : points(S, E));
          lastSteps = 1;
        }
        let modeMsg = '';
        if (paramTrack && ['off', undefined, null].includes(paramTrack.automationMode?.value)) { await paramTrack.setAutomationMode('read').catch(() => undefined); modeMsg = ` ${t('modeRead')}`; lastSteps++; }
        await markWritten(p, true); renderPicker(); void loadGhost();
        note('write', { param: p.label, points: n, S, E, opts });
        say(null); $('status').textContent = t('written', { n, p: p.label }) + modeMsg; $('status').className = 'status ok';
      } catch (e) { note('write failed', { e: errText(e) }); say('failed', { e: errText(e) }, 'bad', 9000); }
      busy = false; $('write').disabled = false;
    }
    async function clear() {
      const p = current();
      if (!p || busy) return;
      busy = true;
      try { const { S, E } = span(); const cs = p.pair ?? [p.control]; for (const c of cs) { await c.automation.load?.(); await c.automation.clear(S, E); } lastSteps = cs.length; let any = false; for (const c of cs) if (await laneHasPoints(c)) any = true; if (!any) { await markWritten(p, false); handAuto.delete(p.key); } renderPicker(); void loadGhost(); say('cleared', {}, 'ok', 4000); }
      catch (e) { note('clear failed', { e: errText(e) }); say('failed', { e: errText(e) }, 'bad', 8000); }
      busy = false;
    }
    $('write').onclick = () => void write();
    $('clear').onclick = () => void clear();
    $('undo').onclick = async () => { if (!lastSteps) return; try { await s.undo(lastSteps); lastSteps = 0; say('undone', {}, 'ok', 3000); } catch (e) { say('failed', { e: errText(e) }, 'bad', 6000); } };
    $('ver').onclick = async (ev) => {
      if (!ev.altKey) return;
      const text = JSON.stringify({ version: VERSION, window: fitInfo, ua: navigator.userAgent, track: paramTrack?.name.value, param: current()?.label, span: span(), opts, log }, null, 2);
      try { if (await AddOnCopy(text)) say('report', {}, 'ok', 5000); } catch { /* nothing */ }
    };
    let loadTimer;
    const reload = () => { clearTimeout(loadTimer); loadTimer = setTimeout(() => void loadParams(), 150); };
    // Follow the track's plug-ins: when one is added, removed or swapped (or its parameters arrive a
    // moment after loading), the list refreshes by itself.
    const signature = () => {
      const tk = track();
      if (!tk) return '';
      const fx = (tk.effects?.items ?? []).map((f) => `${f.insertType?.value}:${f.pluginId?.value ?? ''}:${f.instanceId?.value ?? ''}:${(f.params ?? []).length}`).join('|');
      const outs = (tk.outputs?.items ?? []).map((o) => `${o.path?.split('/').pop()}:${o.assigned ? 1 : 0}`).join('|');
      return `${tk.id}#${tk.stemFormat?.value}#${fx}#${outs}`;
    };
    let lastSig = '';
    setInterval(async () => {
      if (busy || document.hidden) return;
      const tk = track();
      if (tk) { await tk.effects?.load?.().catch(() => undefined); for (const f of (tk.effects?.items ?? []).filter((e) => !e.isEmpty)) await f.controls?.load?.().catch(() => undefined); }
      const sig = signature();
      if (sig !== lastSig) { if (lastSig) tables.clear(); lastSig = sig; reload(); }
    }, 1500);
    window.addEventListener('focus', () => { lastSig = ''; });
    for (const p of [ctx.selectionTracks, ctx.lastSelectedTrack]) p?.onChange?.(() => { if (track() !== paramTrack) reload(); });
    for (const p of [ctx.selectionStart, ctx.selectionStop, tr.loopStart, tr.loopStop, tr.looping, tr.playStart]) p?.onChange?.(() => redraw());
    await loadWritten();
    await loadParams();
  }

  // Fit the page to the size LUNA says its window has. On some Windows set-ups LUNA lays the
  // page out taller than the part of the window you can see (and does not grow it when the window
  // is stretched), so the bottom bar ended up out of sight. When LUNA's size and the page's
  // differ, the page takes LUNA's height; when they match (as on a Mac) nothing changes.
  let me = null, fitInfo = null;
  async function fitToWindow() {
    try { me = await luna.gui.thisInstance(); } catch { me = null; }
    // On Windows LUNA sizes the page to the window's outer size, frame included, so the last
    // 39 px (title bar + borders) and 16 px on the right fall outside what you can see.
    // Measured on a customer's screenshot: page 900 x 701, visible 884 x 662.
    const win = /^Win/i.test(navigator.platform || '');
    const INSET_W = win ? 16 : 0, INSET_H = win ? 39 : 0;
    const fit = () => {
      const h = Number(me?.height?.value) || 0, inner = window.innerHeight, innerW = window.innerWidth;
      let useH = h > 0 && inner - h > 4 ? Math.min(h, inner) : inner;
      useH -= INSET_H;
      const useW = innerW - INSET_W;
      const fitted = useH < inner || useW < innerW;
      const st = [document.documentElement.style, document.body.style];
      for (const s of st) { s.height = fitted ? `${useH}px` : ''; s.width = useW < innerW ? `${useW}px` : ''; }
      document.documentElement.style.overflow = fitted ? 'auto' : '';
      fitInfo = { lunaW: Number(me?.width?.value) || null, lunaH: h || null, innerW, innerH: inner, outerW: window.outerWidth, outerH: window.outerHeight, screenX: window.screenX, screenY: window.screenY, vvH: window.visualViewport?.height ?? null, dpr: window.devicePixelRatio, fitted: fitted ? `${useW}x${useH}` : null, platform: navigator.platform };
    };
    fit();
    me?.height?.onChange?.(fit); me?.width?.onChange?.(fit);
    window.addEventListener('resize', fit);
    note('fit', fitInfo);
  }

  (async () => {
    for (;;) {
      try { luna = await Luna.connect(); break; }
      catch { say('waiting'); await new Promise((r) => setTimeout(r, 1500)); }
    }
    Luna.bindShortcuts(luna, { onError: () => undefined });
    void fitToWindow();
    await luna.sessions.ready();
    luna.sessions.focused.onChange(() => void build());
    await build();
    tour ??= window.AddOnTour?.attach({
      button: $('help'), key: `${KEY}tourSeen`,
      labels: () => ({ next: t('tNext'), back: t('tBack'), skip: t('tSkip'), done: t('tDone') }),
      language: {
        sel: '#lang',
        list: () => Object.keys(I18N).map((c) => [c, I18N[c]._name]),
        current: () => lang,
        set: (c) => { $('lang').value = c; $('lang').dispatchEvent(new Event('change')); },
        title: () => t('langT'), text: () => t('langX'),
      },
      steps: () => [
        { sel: '#picker', title: () => t('q1t'), text: () => t('q1') },
        { sel: '.stage', title: () => t('q2t'), text: () => t('q2') },
        { sel: '.controls', title: () => t('q3t'), text: () => t('q3') },
        { sel: '#write', title: () => t('q4t'), text: () => t('q4') },
        { sel: '#help', title: () => t('zt'), text: () => t('z') },
      ],
    });
  })();
})();

export interface EinsteinFactCard {
  title: string
  body: string
  eyebrow?: string
}

export interface EinsteinTimelineEntry {
  year: string
  title: string
  description: string
}

export interface EinsteinPromptCard {
  label: string
  prompt: string
  note: string
}

export interface EinsteinRelationship {
  name: string
  role: string
  dynamic: string
}

export interface EinsteinGalleryImage {
  src: string
  alt: string
  caption: string
  credit?: string
}

export interface EinsteinQuoteItem {
  text: string
  attribution: string
}

export interface EinsteinPrototypeContent {
  eyebrow: string
  ambientLabel: string
  quote: string
  quoteAttribution: string
  featuredQuotes: EinsteinQuoteItem[]
  summary: string
  atmosphere: string
  quickFacts: Array<{ label: string; value: string }>
  timeline: EinsteinTimelineEntry[]
  contextCards: EinsteinFactCard[]
  relationships: EinsteinRelationship[]
  promptCards: EinsteinPromptCard[]
  tonePills: string[]
  suggestedTopics: string[]
  galleryImages: EinsteinGalleryImage[]
}

export const einsteinPrototypeContent: EinsteinPrototypeContent = {
  eyebrow: 'Fisico teorico',
  ambientLabel: 'Berna, Zurich, Princeton',
  quote: 'La imaginación es más importante que el conocimiento. El conocimiento es limitado; la imaginación rodea el mundo.',
  quoteAttribution: 'Albert Einstein',
  featuredQuotes: [
    {
      text: 'La imaginación es más importante que el conocimiento. El conocimiento es limitado; la imaginación rodea el mundo.',
      attribution: 'Albert Einstein',
    },
    {
      text: 'Lo importante es no dejar de hacerse preguntas. La curiosidad tiene su propia razón de existir.',
      attribution: 'Albert Einstein',
    },
    {
      text: 'La vida es como andar en bicicleta. Para mantener el equilibrio, debes seguir moviéndote.',
      attribution: 'Albert Einstein',
    },
    {
      text: 'No podemos resolver nuestros problemas con la misma forma de pensar que usamos al crearlos.',
      attribution: 'Albert Einstein',
    },
  ],
  summary:
    'Albert Einstein fue uno de los grandes arquitectos de la física moderna. Su trabajo sobre la relatividad, la luz y la estructura del universo transformó la ciencia del siglo XX y lo convirtió también en una voz pública sobre guerra, paz y responsabilidad moral.',
  atmosphere:
    'Nacido en Ulm en 1879, Einstein desarrolló una forma de pensar apoyada en experimentos mentales: imaginarse viajando junto a un rayo de luz, observar relojes en movimiento o preguntarse cómo se curva el espacio cerca de una estrella. Esa mezcla de intuición, matemáticas y curiosidad marcó toda su obra.',
  quickFacts: [
    { label: 'Origen', value: 'Ulm, Imperio alemán' },
    { label: 'Época activa', value: '1905 - 1955' },
    { label: 'Rasgo intelectual', value: 'Curiosidad radical y claridad conceptual' },
    { label: 'Intereses persistentes', value: 'Tiempo, luz, gravedad, paz y responsabilidad' },
  ],
  timeline: [
    {
      year: '1905',
      title: 'Annus mirabilis',
      description:
        'Publica los trabajos que reorganizan la física moderna: efecto fotoeléctrico, movimiento browniano y relatividad especial.',
    },
    {
      year: '1915',
      title: 'Relatividad general',
      description:
        'Formula una nueva manera de pensar la gravedad: ya no como fuerza clásica, sino como curvatura del espacio-tiempo.',
    },
    {
      year: '1921',
      title: 'Nobel y celebridad pública',
      description:
        'Su figura se vuelve planetaria. A partir de aquí ya no es solo científico: también es símbolo cultural y político.',
    },
    {
      year: '1933',
      title: 'Exilio y Princeton',
      description:
        'Huida del nazismo, ruptura con Europa y nueva etapa en Estados Unidos. El contexto histórico entra en la conversación.',
    },
    {
      year: '1945+',
      title: 'Conciencia moral de la ciencia',
      description:
        'Tras la bomba atómica, su papel público gira hacia la advertencia ética, el pacifismo y la responsabilidad global.',
    },
  ],
  contextCards: [
    {
      eyebrow: 'Idea central',
      title: 'Pensar con experimentos mentales',
      body:
        'Einstein solía convertir problemas abstractos en escenas imaginables: un observador dentro de un tren, relojes sincronizados a distancia, ascensores en caída libre o haces de luz cruzando el espacio.',
    },
    {
      eyebrow: 'Biografía histórica',
      title: 'Brillantez, exilio y conflicto',
      body:
        'Su vida no fue la de un sabio aislado. Vivió el ascenso del nazismo, abandonó Alemania en 1933, se instaló en Princeton y tuvo que pensar públicamente qué responsabilidades tiene un científico en tiempos de violencia política.',
    },
    {
      eyebrow: 'Legado',
      title: 'Más que relatividad',
      body:
        'Además de la relatividad, dejó contribuciones decisivas al estudio del efecto fotoeléctrico, el movimiento browniano y la discusión sobre los fundamentos de la mecánica cuántica.',
    },
  ],
  relationships: [
    {
      name: 'Niels Bohr',
      role: 'Rival intelectual fecundo',
      dynamic: 'Ideal para conversaciones sobre incertidumbre, realidad y los límites de la física.',
    },
    {
      name: 'Mileva Maric',
      role: 'Vínculo personal y zona sensible',
      dynamic: 'Aporta una capa humana, doméstica y menos heroica a la conversación.',
    },
    {
      name: 'Europa del entreguerras',
      role: 'Entorno histórico hostil',
      dynamic: 'Permite abrir el chat a exilio, antisemitismo, paz y responsabilidad política.',
    },
  ],
  promptCards: [
    {
      label: '1905',
      prompt: 'Explícame por qué 1905 cambió la física para siempre.',
      note: 'Abre la puerta al efecto fotoeléctrico, al movimiento browniano y a la relatividad especial.',
    },
    {
      label: 'Bohr y la cuántica',
      prompt: '¿Por qué no te convencía la interpretación cuántica de Bohr?',
      note: 'Permite entrar en su idea de causalidad, realidad física y el famoso “Dios no juega a los dados”.',
    },
    {
      label: 'Exilio y política',
      prompt: '¿Cómo te transformó vivir el exilio y ver el ascenso del nazismo?',
      note: 'Conecta biografía, antisemitismo, pacifismo y el lugar del científico en la historia.',
    },
  ],
  tonePills: ['Claro', 'Curioso', 'Reflexivo', 'Irónico por momentos', 'Didáctico sin simplismo'],
  suggestedTopics: [
    'Relatividad explicada sin fórmulas',
    'Qué imaginaba cuando pensaba en la luz',
    'Su desacuerdo con la mecánica cuántica',
    'Ciencia y responsabilidad moral',
    'Vida en Princeton y memoria de Europa',
    'Cómo veía el futuro de la humanidad',
  ],
  galleryImages: [
    {
      src: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg',
      alt: 'Retrato de Albert Einstein en blanco y negro',
      caption: 'Retrato tardío de Einstein, ya convertido en una figura pública mundial y referente moral de la ciencia del siglo XX.',
      credit: 'Fotografía de Oren J. Turner, Princeton, 1947. Wikimedia Commons.',
    },
    {
      src: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
      alt: 'Albert Einstein fotografiado en 1921',
      caption: 'Einstein en los años de consolidación internacional de su fama, poco después del impacto global de la relatividad general.',
      credit: 'Ferdinand Schmutzer, 1921. Wikimedia Commons.',
    },
    {
      src: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Einstein_1933.jpg',
      alt: 'Albert Einstein durante la década de 1930',
      caption: 'Imagen de la etapa marcada por el exilio y la salida definitiva de Europa ante el ascenso del nazismo.',
      credit: 'Fotografía de 1933. Wikimedia Commons.',
    },
  ],
}
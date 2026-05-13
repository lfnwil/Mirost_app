import type { Profile } from "@/types/profile"

const testAttachmentUrls = {
  image: "/test-attachments/mirost-test-image.svg",
  pdf: "/test-attachments/mirost-test-document.pdf",
  video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  mp3: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
}

export const mockProfiles: Profile[] = [
  {
    id: "lea-m",
    name: "Lea Martin",
    title: "Création & Digital Design",
    bio: "Etudiante en design graphique, Lea accompagne des projets culturels et associatifs pour poser une identite visuelle simple, propre et facile a deployer.",
    tags: ["Design", "Branding", "Identite visuelle"],
    avatarUrl: "https://i.pravatar.cc/120?img=32",
    location: "Paris",
    availability: ["Disponible cette semaine", "Missions courtes"],
    attachments: [
      {
        id: "lea-identite-visuelle",
        name: "PJ test - image SVG",
        url: testAttachmentUrls.image,
        contentType: "image/svg+xml",
        size: 984
      },
      {
        id: "lea-document-pdf",
        name: "PJ test - document PDF",
        url: testAttachmentUrls.pdf,
        contentType: "application/pdf",
        size: 652
      },
      {
        id: "lea-extrait-mp3",
        name: "PJ test - extrait MP3",
        url: testAttachmentUrls.mp3,
        contentType: "audio/mpeg",
        size: 39868
      }
    ],
    links: [
      {
        type: "portfolio",
        label: "Portfolio",
        url: "https://lea-martin.example.com"
      },
      {
        type: "instagram",
        label: "Instagram",
        url: "https://instagram.com/lea.design"
      },
      {
        type: "behance",
        label: "Behance",
        url: "https://behance.net/leamartin"
      }
    ]
  },
  {
    id: "yanis-b",
    name: "Yanis Benali",
    title: "AudioVisuel",
    bio: "Yanis travaille sur des captations, teasers et reels pour des evenements, petites productions et projets musicaux avec une approche rapide et terrain.",
    tags: ["Video", "Montage", "Audiovisuel"],
    avatarUrl: "https://i.pravatar.cc/120?img=12",
    location: "Lyon",
    availability: ["Soirs et week-ends", "Disponible cette semaine"],
    attachments: [
      {
        id: "yanis-teaser",
        name: "PJ test - video MP4",
        url: testAttachmentUrls.video,
        contentType: "video/mp4",
        size: 1128375
      }
    ],
    links: [
      {
        type: "portfolio",
        label: "Portfolio",
        url: "https://yanis-benali.example.com"
      },
      {
        type: "youtube",
        label: "YouTube / Vimeo",
        url: "https://vimeo.com/yanisbenali"
      }
    ]
  },
  {
    id: "ines-r",
    name: "Ines Rahmani",
    title: "Marketing & Communication digitale",
    bio: "Ines construit des contenus pour les reseaux sociaux, des angles editoriaux et des mini-campagnes digitales avec un rendu clair et regulier.",
    tags: ["Social media", "Storytelling", "Contenu court"],
    avatarUrl: "https://i.pravatar.cc/120?img=47",
    location: "Lille",
    availability: ["Disponible sous 48h", "Missions courtes"],
    attachments: [
      {
        id: "ines-serie-portrait",
        name: "Serie portrait - selection",
        url: "https://picsum.photos/seed/mirost-ines/1200/800",
        contentType: "image/jpeg",
        size: 1420000
      },
      {
        id: "ines-coulisses",
        name: "Coulisses editoriales",
        url: "https://picsum.photos/seed/mirost-ines-b/1200/800",
        contentType: "image/jpeg",
        size: 1180000
      }
    ],
    links: [
      {
        type: "portfolio",
        label: "Portfolio",
        url: "https://ines-rahmani.example.com"
      },
      {
        type: "instagram",
        label: "Instagram",
        url: "https://instagram.com/ines.photo"
      }
    ]
  },
  {
    id: "tom-h",
    name: "Tom Harel",
    title: "Son & Musique",
    bio: "Tom compose des habillages sonores et des boucles originales pour des formats courts, podcasts, bandes-annonces ou installations artistiques.",
    tags: ["Son", "Musique", "Podcast"],
    avatarUrl: "https://i.pravatar.cc/120?img=54",
    location: "Nantes",
    availability: ["A distance uniquement", "Soirs et week-ends"],
    attachments: [],
    links: [
      {
        type: "soundcloud",
        label: "SoundCloud",
        url: "https://soundcloud.com/tomharel"
      },
      {
        type: "portfolio",
        label: "Portfolio",
        url: "https://tom-harel.example.com"
      }
    ]
  },
  {
    id: "maya-d",
    name: "Maya Dufour",
    title: "Création & Digital Design",
    bio: "Maya cree des visuels sur mesure pour des affiches, stories, mini-campagnes ou supports de mediation culturelle avec une patte claire et expressive.",
    tags: ["Illustration", "Affiche", "Edition"],
    avatarUrl: "https://i.pravatar.cc/120?img=5",
    location: "Bordeaux",
    availability: ["Missions courtes", "Disponible cette semaine"],
    attachments: [
      {
        id: "maya-affiche",
        name: "Affiche culturelle",
        url: "https://picsum.photos/seed/mirost-maya/1200/800",
        contentType: "image/jpeg",
        size: 1040000
      }
    ],
    links: [
      {
        type: "portfolio",
        label: "Portfolio",
        url: "https://maya-dufour.example.com"
      },
      {
        type: "instagram",
        label: "Instagram",
        url: "https://instagram.com/maya.illustre"
      }
    ]
  },
  {
    id: "noe-v",
    name: "Noe Vidal",
    title: "AudioVisuel",
    bio: "Noe monte et anime des contenus courts pour lancer un evenement, presenter une programmation ou donner une presence plus dynamique a une marque.",
    tags: ["Motion", "Animation", "Reels"],
    avatarUrl: "https://i.pravatar.cc/120?img=68",
    location: "Marseille",
    availability: ["A partir de la semaine prochaine", "A distance uniquement"],
    attachments: [
      {
        id: "noe-storyboard",
        name: "Storyboard reel anime",
        url: "https://picsum.photos/seed/mirost-noe/1200/800",
        contentType: "image/jpeg",
        size: 1320000
      }
    ],
    links: [
      {
        type: "portfolio",
        label: "Portfolio",
        url: "https://noe-vidal.example.com"
      },
      {
        type: "youtube",
        label: "YouTube / Vimeo",
        url: "https://youtube.com/@noevidal"
      }
    ]
  }
]

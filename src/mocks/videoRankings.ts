export interface VideoItem {
  rank: number;
  videoId: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  uploadDate: string;
  category: string;
  country: string;
}

export const videoRankingsData: VideoItem[] = [
  { rank: 1, videoId: 'n0fLuom2Imk', title: 'Google Gemini en: Las aventuras de Capi.', channelName: 'Google México', channelAvatar: 'https://i.playboard.app/p/f3TCtiDfTUggIVJhCa1-ijKgD_xYzwmIjmV0xeIei6Bp-f2x4BJ6JCtvpfA--Hb3lgFUGnJ-lZ0/100x100.jpg', views: 2800000, uploadDate: '2026-04-18', category: 'Technology', country: 'MX' },
  { rank: 2, videoId: 'zY1FI53ubYM', title: '¡Haz tu primer pedido en línea!', channelName: 'Bodega Aurrera', channelAvatar: 'https://i.playboard.app/p/niOxSf6TIQxmZhgxnty9GjlLugh2lyOVbwdgms6zxVM8NuueY30u7SYUN9dLJEWYGPDvBa1rKg/100x100.jpg', views: 2400000, uploadDate: '2026-04-17', category: 'Entertainment', country: 'MX' },
  { rank: 3, videoId: 'hBJeMU5TCMc', title: '¡ATAQUE EN PUERTA! TRUMP AMENAZA CON DESTRUIR 1RÁN', channelName: 'TuProfeDeRI Jesús López', channelAvatar: 'https://i.playboard.app/p/jlsHVaeeVM8lv-oKktWRqGVESnhZAKux2NvkP0N12L32WFl7-xPAIJefWlsqYrMDByjZBt_oAg/100x100.jpg', views: 1950000, uploadDate: '2026-04-19', category: 'News', country: 'MX' },
  { rank: 4, videoId: 'chzZhpAMQsE', title: 'Jornada 6 - EWC Qualifier | FFWS LATAM 2026', channelName: 'Garena Free Fire LATAM', channelAvatar: 'https://i.playboard.app/p/AfjCotlc00p3-kIr-Eq8b0bJYhpwJq8nlZ1rYuU3rznTtFkxBPthJVLjDQRmwxvmX2rzPZzCFg/100x100.jpg', views: 1720000, uploadDate: '2026-04-19', category: 'Gaming', country: 'MX' },
  { rank: 5, videoId: 'p2AzyIEuFak', title: 'N+ FORO noticias en vivo 24/7', channelName: 'NMás', channelAvatar: 'https://i.playboard.app/p/kA_x-j3dIDq8_JLXM9-J3KCVNPe55QdriYeSDqI1chZ_4uoafOzRk1oImfbf90svo6ID8P0Xsg/100x100.jpg', views: 1580000, uploadDate: '2026-04-18', category: 'News', country: 'MX' },
  { rank: 6, videoId: 'weLXdwVjSxs', title: 'Transmisión en vivo de Multimedios', channelName: 'MULTIMEDIOS', channelAvatar: 'https://i.playboard.app/p/AIdro_k_I0iTeZLhP_tm3tXrvRroluPTmFPqAtp2e353c3tOCNHw/100x100.jpg', views: 1340000, uploadDate: '2026-04-17', category: 'News', country: 'MX' },
  { rank: 7, videoId: '5MngDZYYEGw', title: 'MADRUGUETE DE TRUMP! LOS SORPRENDE. QUIERE ENTRAR. IRAN ALISTA TROPAS.', channelName: '24 Noticias - JUCA', channelAvatar: 'https://i.playboard.app/p/AATXAJys09jfwR1EBd07-UdKulWVORJJkIE9wvqO_ZorMQ/100x100.jpg', views: 1120000, uploadDate: '2026-04-19', category: 'News', country: 'MX' },
  { rank: 8, videoId: 'fy_fYd3ZwPE', title: 'MARATÓN de TRAVESURAS de El Chavo del 8', channelName: 'El Chavo del 8', channelAvatar: 'https://i.playboard.app/p/6oC6lwrAGWZw_yofByn8LFtuZ14TZrZirGdrHCxlJzst78hSbc3gvgehy8FmCf56Gy5RBYz3bw/100x100.jpg', views: 980000, uploadDate: '2026-04-16', category: 'Entertainment', country: 'MX' },
  { rank: 9, videoId: 'tQ941SU5UR0', title: 'Milenio Noticias EN VIVO', channelName: 'MILENIO', channelAvatar: 'https://i.playboard.app/p/x84Jebx5DW47QOE8PqmTc5eauYa2E8XeE-OvcHV_L5_WG_OTFxWNtiC0Fz4NCVAfDDxEBG3x-w/100x100.jpg', views: 870000, uploadDate: '2026-04-18', category: 'News', country: 'MX' },
  { rank: 10, videoId: 'uIWK2EiK2nQ', title: 'CRL DIA 2! FASE DE GRUPOS! MOHAMED IAN RYLEY BETFAS GOGO #clashroyale', channelName: 'RockstarCR', channelAvatar: 'https://i.playboard.app/p/W6JqxPD93IJnUjNA5gCH201w3hVyqPoQrMduLunjj0dx34RWW4C5on9GJCo5z7EbsCiMYMEhPPM/100x100.jpg', views: 760000, uploadDate: '2026-04-19', category: 'Gaming', country: 'MX' },
  { rank: 11, videoId: 'VwzbQ6Js-fw', title: 'Servicio Dominical | Pr. Ángel Montes | Cristo Vive | # 190426', channelName: 'Cristo Vive Oficial', channelAvatar: 'https://i.playboard.app/p/pTK_AxsoQRrVnIb5ClBoK7DuTrHEL_E1tXp6j5gY7zFQYfUC9-ergPBI3iyzB9Wabt9YtxsbejU/100x100.jpg', views: 640000, uploadDate: '2026-04-19', category: 'Education', country: 'MX' },
  { rank: 12, videoId: 'q5fb5VvczIE', title: 'MANCHESTER CITY VS ARSENAL | NARRACIÓN EN VIVO | PREMIER LEAGUE', channelName: 'TNT Sports México', channelAvatar: 'https://i.playboard.app/p/CnVAPJfOPWUaLzLZBuIbcVWNFYcFYfnlPQ1DqOlk0JW4u4KnM40fR00fKVRF5x-Dz1ehguS5/100x100.jpg', views: 590000, uploadDate: '2026-04-18', category: 'Sports', country: 'MX' },
  { rank: 13, videoId: '7m3AwcLJoLU', title: 'La importancia de saber lo que quieres con Alejandro Nones', channelName: 'El Humano es un Animal', channelAvatar: 'https://i.playboard.app/p/Hg0ABjoUpLYNtk5dOitJ2EgW7jzsPRn5ArhgGs2gcmtmSA8oIjoZLUKTBzfFs2hAXIJP-Od7Yw/100x100.jpg', views: 520000, uploadDate: '2026-04-17', category: 'Entertainment', country: 'MX' },
  { rank: 14, videoId: 'lmegr5o6p7c', title: 'Claudio Alcaraz - Hola, ¿Qué tal? (Video Oficial)', channelName: 'Claudio Alcaraz', channelAvatar: 'https://i.playboard.app/p/XJ7SiDxlvpkSRt_FPKiKNjhs2y7sZne54t_dJPhSmruGz5ZjlggEqiu2V7KoB3QgC42TSLn2rw/100x100.jpg', views: 480000, uploadDate: '2026-04-15', category: 'Music', country: 'MX' },
  { rank: 15, videoId: 'n0fLuom2Im2', title: 'BTS - Dynamite (Official MV)', channelName: 'HYBE LABELS', channelAvatar: 'https://i.playboard.app/p/AIdro_lHMh1Lw2um9qDjPFP6BM_NSC3yjunDMlcamgdEqlslcOY/100x100.jpg', views: 420000, uploadDate: '2026-04-14', category: 'Music', country: 'KR' },
  { rank: 16, videoId: 'n0fLuom2Im3', title: 'How to Build a React App in 2026', channelName: 'Fireship', channelAvatar: 'https://i.playboard.app/p/YZ7gOQ8piWHJELvXxq0p2rIb942UdvBCy27y6DwTxE2-t_y7Iemd4vM17QmLMJra82s5gxzlL_s/100x100.jpg', views: 390000, uploadDate: '2026-04-13', category: 'Technology', country: 'US' },
  { rank: 17, videoId: 'n0fLuom2Im4', title: 'IPL 2026 Final Highlights', channelName: 'Star Sports', channelAvatar: 'https://i.playboard.app/p/CXjPCwqHWq_X1SznGbTd6O3wVoPjxRbTgyy8Q3fAo83GQSPmi8T5NVohcMyz8pw7HI3Qbw5lng/100x100.jpg', views: 360000, uploadDate: '2026-04-12', category: 'Sports', country: 'IN' },
  { rank: 18, videoId: 'n0fLuom2Im5', title: 'Minecraft 1.22 - Everything New!', channelName: 'Dream', channelAvatar: 'https://i.playboard.app/p/bzwZa2MXC9ZEyfYPSsLvg-LOUTQ2Q8E0QnTs512qmy6adr7Vm8thj8Ri05OEB6Hz_Nmso05CidM/100x100.jpg', views: 330000, uploadDate: '2026-04-11', category: 'Gaming', country: 'US' },
  { rank: 19, videoId: 'n0fLuom2Im6', title: 'Baby Shark Dance | #babyshark Most Viewed Video', channelName: 'Pinkfong', channelAvatar: 'https://i.playboard.app/p/En0s2T-YxAm-uqrG-7ND0tcj7skVFzkN_LF0w2E_drO0bxW4nC4SppGQEv53wKoCUsBn9UAU3g/100x100.jpg', views: 310000, uploadDate: '2026-04-10', category: 'Kids', country: 'KR' },
  { rank: 20, videoId: 'n0fLuom2Im7', title: 'Gordon Ramsay\'s Perfect Burger Tutorial', channelName: 'Gordon Ramsay', channelAvatar: 'https://i.playboard.app/p/f3gHNyF4omCvi9dRThcWpRYNKNJuGoeyOAA2ucz7_1kue-6qPRZCsXJIsXeQjCClYrhvBFmUDA/100x100.jpg', views: 290000, uploadDate: '2026-04-09', category: 'Entertainment', country: 'US' },
  { rank: 21, videoId: 'n0fLuom2Im8', title: 'Coldplay - My Universe (Official Video)', channelName: 'Coldplay', channelAvatar: 'https://i.playboard.app/p/laXXrVdjFWIdweoBMaLB-V6lmTD7Z72EZtCns0IfQRO7vZAPTitBgOKxyJo_SjEITIvIY0if/100x100.jpg', views: 270000, uploadDate: '2026-04-08', category: 'Music', country: 'US' },
  { rank: 22, videoId: 'n0fLuom2Im9', title: 'Tesla Cybertruck 2026 Full Review', channelName: 'Marques Brownlee', channelAvatar: 'https://i.playboard.app/p/xfovVKsxmLVC33Kzt4AzlzB2qx40OpyC4XIdv8ykcdn3RbKn4JMmfqL0EG49tu9nY8i1wLjA/100x100.jpg', views: 250000, uploadDate: '2026-04-07', category: 'Technology', country: 'US' },
  { rank: 23, videoId: 'n0fLuom2Ima', title: 'Yoga for Beginners - 30 Minute Full Body', channelName: 'Yoga with Adriene', channelAvatar: 'https://i.playboard.app/p/AOPolaQGsOmtwyZbdC5X5xGcsNcnbiHHueAl1o8va8RLzQ/100x100.jpg', views: 230000, uploadDate: '2026-04-06', category: 'Education', country: 'US' },
  { rank: 24, videoId: 'n0fLuom2Imb', title: 'Squid Game Season 3 - Official Trailer', channelName: 'Netflix', channelAvatar: 'https://i.playboard.app/p/HypSFGr1HfN26_BZPInOfypRzpWKEkAG-8CXT5838_s_JPxDUV2oqLazBwqMGPDtUSKMyKRqow/100x100.jpg', views: 210000, uploadDate: '2026-04-05', category: 'Entertainment', country: 'US' },
  { rank: 25, videoId: 'n0fLuom2Imc', title: 'World Cup 2026 - Opening Ceremony Highlights', channelName: 'FIFA', channelAvatar: 'https://i.playboard.app/p/uY6I_uKhGP4Xvf2YoF9Wu4MLSAcVocY-rzOL69pMTQ5BUc8Sizk0zh6bdOQDHR9owVYTJ8gEXJc/100x100.jpg', views: 195000, uploadDate: '2026-04-04', category: 'Sports', country: 'US' },
];

export const videoCategories = [
  'All Categories', 'Entertainment', 'Music', 'Technology', 'Gaming', 'Sports', 'News', 'Education', 'Kids',
];

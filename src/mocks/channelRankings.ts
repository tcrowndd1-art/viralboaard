export interface Channel {
  rank: number;
  name: string;
  avatar: string;
  category: string;
  country: string;
  subscribers: number;
  views: number;
  growthPercent: number;
}

export const channelRankingsData: Channel[] = [
  { rank: 1, name: 'MrBeast', avatar: 'https://i.playboard.app/p/YZ7gOQ8piWHJELvXxq0p2rIb942UdvBCy27y6DwTxE2-t_y7Iemd4vM17QmLMJra82s5gxzlL_s/100x100.jpg', category: 'Entertainment', country: 'US', subscribers: 312000000, views: 48200000000, growthPercent: 2.4 },
  { rank: 2, name: 'T-Series', avatar: 'https://i.playboard.app/p/CXjPCwqHWq_X1SznGbTd6O3wVoPjxRbTgyy8Q3fAo83GQSPmi8T5NVohcMyz8pw7HI3Qbw5lng/100x100.jpg', category: 'Music', country: 'IN', subscribers: 278000000, views: 252000000000, growthPercent: 1.1 },
  { rank: 3, name: 'Cocomelon', avatar: 'https://i.playboard.app/p/En0s2T-YxAm-uqrG-7ND0tcj7skVFzkN_LF0w2E_drO0bxW4nC4SppGQEv53wKoCUsBn9UAU3g/100x100.jpg', category: 'Education', country: 'US', subscribers: 185000000, views: 178000000000, growthPercent: 0.8 },
  { rank: 4, name: 'SET India', avatar: 'https://i.playboard.app/p/bzwZa2MXC9ZEyfYPSsLvg-LOUTQ2Q8E0QnTs512qmy6adr7Vm8thj8Ri05OEB6Hz_Nmso05CidM/100x100.jpg', category: 'Entertainment', country: 'IN', subscribers: 176000000, views: 145000000000, growthPercent: 0.5 },
  { rank: 5, name: 'Vlad and Niki', avatar: 'https://i.playboard.app/p/f3gHNyF4omCvi9dRThcWpRYNKNJuGoeyOAA2ucz7_1kue-6qPRZCsXJIsXeQjCClYrhvBFmUDA/100x100.jpg', category: 'Kids', country: 'US', subscribers: 122000000, views: 89000000000, growthPercent: 1.9 },
  { rank: 6, name: 'Like Nastya', avatar: 'https://i.playboard.app/p/laXXrVdjFWIdweoBMaLB-V6lmTD7Z72EZtCns0IfQRO7vZAPTitBgOKxyJo_SjEITIvIY0if/100x100.jpg', category: 'Kids', country: 'RU', subscribers: 119000000, views: 98000000000, growthPercent: 1.3 },
  { rank: 7, name: 'Zee Music Company', avatar: 'https://i.playboard.app/p/xfovVKsxmLVC33Kzt4AzlzB2qx40OpyC4XIdv8ykcdn3RbKn4JMmfqL0EG49tu9nY8i1wLjA/100x100.jpg', category: 'Music', country: 'IN', subscribers: 112000000, views: 67000000000, growthPercent: 0.7 },
  { rank: 8, name: 'WWE', avatar: 'https://i.playboard.app/p/AOPolaQGsOmtwyZbdC5X5xGcsNcnbiHHueAl1o8va8RLzQ/100x100.jpg', category: 'Sports', country: 'US', subscribers: 101000000, views: 82000000000, growthPercent: 0.3 },
  { rank: 9, name: 'Blackpink', avatar: 'https://i.playboard.app/p/AIdro_lHMh1Lw2um9qDjPFP6BM_NSC3yjunDMlcamgdEqlslcOY/100x100.jpg', category: 'Music', country: 'KR', subscribers: 97000000, views: 34000000000, growthPercent: 2.1 },
  { rank: 10, name: 'Mariano Razo', avatar: 'https://i.playboard.app/p/HypSFGr1HfN26_BZPInOfypRzpWKEkAG-8CXT5838_s_JPxDUV2oqLazBwqMGPDtUSKMyKRqow/100x100.jpg', category: 'Entertainment', country: 'MX', subscribers: 89000000, views: 21000000000, growthPercent: 3.2 },
  { rank: 11, name: 'Fede Vigevani', avatar: 'https://i.playboard.app/p/YZ7gOQ8piWHJELvXxq0p2rIb942UdvBCy27y6DwTxE2-t_y7Iemd4vM17QmLMJra82s5gxzlL_s/100x100.jpg', category: 'Gaming', country: 'AR', subscribers: 84000000, views: 18500000000, growthPercent: 4.1 },
  { rank: 12, name: 'ElAbrahaham', avatar: 'https://i.playboard.app/p/GptitG8W9CTsa11iuRRszlFomYLnhcK4rfuiaG2Rq_0O63gIQA2W5nM4AIZ2N_nkGkQKamQq8g/100x100.jpg', category: 'Entertainment', country: 'MX', subscribers: 78000000, views: 15200000000, growthPercent: 2.8 },
  { rank: 13, name: 'Taco De Ojo Comediante', avatar: 'https://i.playboard.app/p/lMpdeiBVtF8gnxucVnEwzDjnRftMwcgZ-x9L-r9X0eHj6qzYoKRO2zOQRgmW8p6-VBlq77LaYw/100x100.jpg', category: 'Comedy', country: 'MX', subscribers: 71000000, views: 12800000000, growthPercent: 5.6 },
  { rank: 14, name: 'Mero Bee', avatar: 'https://i.playboard.app/p/oXBhJ9by6ztiKXipmpka2Adym_oi4eq5WcqpMUYSq2EP8bMTaA9-JQrm9AnPLuxNIpQeSEZJ7w/100x100.jpg', category: 'Entertainment', country: 'MX', subscribers: 65000000, views: 9400000000, growthPercent: 3.7 },
  { rank: 15, name: 'MC CHICOGIL', avatar: 'https://i.playboard.app/p/bHdMJybmvqz7tz1BWQCQDwKc-eBes60bgV1g6wxBeb8ea916QVCGXcqjmm7WVlmJwIZ2DM_6/100x100.jpg', category: 'Music', country: 'MX', subscribers: 58000000, views: 7600000000, growthPercent: 3.7 },
  { rank: 16, name: 'SleepID', avatar: 'https://i.playboard.app/p/GvXiKEzN9w7U14hCKQZdqF0eDCn-V46QZTQ_eiOyDk1AbJCr5ZR02eaI9pnjHhyF-EUXCzhhmw/100x100.jpg', category: 'Education', country: 'ID', subscribers: 52000000, views: 6100000000, growthPercent: 2.9 },
  { rank: 17, name: 'Capitán Datos', avatar: 'https://i.playboard.app/p/wa1XY2gFd216C1hKC7K-6I_hCFGbi9toGOBPxVPpgtSX7Z1tTW6_Dml1Mbiu_lEBxBckvhyrNA/100x100.jpg', category: 'Education', country: 'MX', subscribers: 47000000, views: 5300000000, growthPercent: 2.5 },
  { rank: 18, name: 'Layvtime', avatar: 'https://i.playboard.app/p/JWU2wAi_fJDV2P5DGR69g5WPzNb73u33ktkOcZp64EdB2SwEgKjpiIg1Ae0gzjbgfqtvDSG2/100x100.jpg', category: 'Gaming', country: 'MX', subscribers: 43000000, views: 4800000000, growthPercent: 1.6 },
  { rank: 19, name: 'Campechaneando', avatar: 'https://i.playboard.app/p/h-Rk6-1hk4DksO5mojF87_h5FJaIxl4p01aZqWX1z_BIg_Ci3Mk17hM-MDRTOxoJOE0e0cbV/100x100.jpg', category: 'News', country: 'MX', subscribers: 39000000, views: 4200000000, growthPercent: 1.2 },
  { rank: 20, name: 'Latinus_us', avatar: 'https://i.playboard.app/p/abab667e0d639161f872df3fb376734e/100x100.jpg', category: 'News', country: 'MX', subscribers: 35000000, views: 3900000000, growthPercent: 0.9 },
  { rank: 21, name: 'CuriosaMente', avatar: 'https://i.playboard.app/p/AATXAJxalG6394AQRxnsKlWH4g4Gl5eUP5XzLkBsJbQMUg/100x100.jpg', category: 'Education', country: 'MX', subscribers: 31000000, views: 3400000000, growthPercent: 1.8 },
  { rank: 22, name: 'Ivra Kadisha', avatar: 'https://i.playboard.app/p/6PF5iomhOLcmMYhZFtiYEX4Ms3tDuk-rrFaqIRd0tvXsaF8cUoHdJ-e6Obsu1A2H1EFVUe3yCg/100x100.jpg', category: 'Entertainment', country: 'MX', subscribers: 28000000, views: 2900000000, growthPercent: 4.3 },
  { rank: 23, name: 'Tamos Bien!', avatar: 'https://i.playboard.app/p/R3hB0UbWFC66Q2muesU3c8e_L4-UHWDGRCVujG5XCQzrkdrtJyJgO4Sx88f7ttXWHvFEzWBMDA/100x100.jpg', category: 'Entertainment', country: 'MX', subscribers: 24000000, views: 2500000000, growthPercent: 3.1 },
  { rank: 24, name: 'MIGALA', avatar: 'https://i.playboard.app/p/AATXAJzFCiakVbY_0M47jJY0l9rqaLjfadOY5BTQQHi2/100x100.jpg', category: 'Music', country: 'MX', subscribers: 21000000, views: 2100000000, growthPercent: 2.2 },
  { rank: 25, name: 'La Rosa de Guadalupe', avatar: 'https://i.playboard.app/p/AIdro_kLAkgVK17XRIbB71Xrw0YdG0XCBMJ3h76_jJe4aZjivgw/100x100.jpg', category: 'Entertainment', country: 'MX', subscribers: 18000000, views: 1800000000, growthPercent: 0.4 },
];

export const countries = [
  { code: 'ALL', label: 'All Countries' },
  { code: 'US', label: 'United States' },
  { code: 'IN', label: 'India' },
  { code: 'KR', label: 'South Korea' },
  { code: 'MX', label: 'Mexico' },
  { code: 'AR', label: 'Argentina' },
  { code: 'RU', label: 'Russia' },
  { code: 'ID', label: 'Indonesia' },
];

export const categories = [
  'All Categories',
  'Entertainment',
  'Music',
  'Gaming',
  'Sports',
  'News',
  'Comedy',
  'Kids',
];

import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import { DataTab } from "../pages/DataTab";
import { StudioTab } from "../pages/StudioTab";
import Login from "../pages/login/page";
import Signup from "../pages/signup/page";
import Dashboard from "../pages/dashboard/page";
import Rankings from "../pages/rankings/page";
import VideoRankings from "../pages/video-rankings/page";
import ChannelDetail from "../pages/channel-detail/page";
import SearchPage from "../pages/search/page";
import InsightsPage from "../pages/insights/page";
import TrendingLivePage from "../pages/trending-live/page";
import AiStudioPage from "../pages/ai-studio/page";
import CommentManagerPage from "../pages/comment-manager/page";
import VideoEditorPage from "../pages/video-editor/page";
import ChromeExtensionPage from "../pages/chrome-extension/page";
import RevenueCalculatorPage from "../pages/revenue-calculator/page";
import RisingPage from '../pages/rising/page';
import CreatorInsightsPage from "../pages/creator-insights/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/data",
    element: <DataTab />,
  },
  {
    path: "/studio",
    element: <StudioTab />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/rankings",
    element: <Rankings />,
  },
  {
    path: "/channel-rankings",
    element: <Navigate to="/rankings" replace />,
  },
  {
    path: "/video-rankings",
    element: <VideoRankings />,
  },
  {
    path: "/channel/:channelId",
    element: <ChannelDetail />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/insights",
    element: <InsightsPage />,
  },
  {
    path: "/trending-live",
    element: <TrendingLivePage />,
  },
  {
    path: "/ai-studio",
    element: <AiStudioPage />,
  },
  {
    path: "/comment-manager",
    element: <CommentManagerPage />,
  },
  {
    path: "/video-editor",
    element: <VideoEditorPage />,
  },
  {
    path: "/chrome-extension",
    element: <ChromeExtensionPage />,
  },
  {
    path: "/revenue-calculator",
    element: <RevenueCalculatorPage />,
  },
  {
    path: "/creator-insights",
    element: <CreatorInsightsPage />,
  },
  {
    path: "/rising",
    element: <RisingPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;

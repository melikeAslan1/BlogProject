import type React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import CreateBlogPage from "./pages/CreateBlogPage";
import MyPostsPage from "./pages/MyPostsPage";
import UpdateBlogPage from "./pages/UpdateBlogPage";

const App: React.FC = () => {
  return(
    <Routes>
      <Route path="/" element={<LandingPage></LandingPage>}/>
      <Route path="/blog" element={<BlogListPage></BlogListPage>}/>
      <Route path="/blog/:slug" element={<BlogPostPage></BlogPostPage>}/>
      <Route path="/app" element={<PrivateRoute><HomePage></HomePage></PrivateRoute>}/>
      <Route path="/app/posts" element={<PrivateRoute><MyPostsPage /></PrivateRoute>} />
      <Route path="/app/create" element={<PrivateRoute><CreateBlogPage /></PrivateRoute>} />
      <Route path="/app/edit/:slug" element={<PrivateRoute><UpdateBlogPage /></PrivateRoute>} />
      <Route path="/login" element={<LoginPage></LoginPage>}/>
      <Route path="/register" element={<RegisterPage></RegisterPage>}/>
      <Route path="*" element={<Navigate to="/" replace></Navigate>}/>
    </Routes>
  );
};
export default App;
import { Routes, Route, Navigate } from "react-router";
import Home_page from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { check_auth } from "./redux/auth_slice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { PulseLoader } from "react-spinners";
import Layout from "./component/layout";
import ProblemsPage from "./pages/allproblem";
import AdminLayout from "./component/adminlayout";
import AdminDashboard from "./admin/admindashboard";
import CreateProblemPanel from "./admin/createproblem";
import ProblemsListPage from "./admin/updatepanel";
import EditProblemPage from "./admin/editproblem";
import DeleteProblemPage from "./admin/delete";
import ManageUsersPage from "./admin/makeadmin";
import DsaProblemPage from "./pages/solveproblem";
import Tscassistant from "./pages/tscassistant";
import Paywall from "./component/payment";
import AdminVideo from "./admin/AdminVideo";
import AdminUpload from "./admin/AdminUpload";
import ProfilePage from "./pages/profile";
import SetPasswordPage from "./pages/setpassword";
import ForumPage from "./pages/discussion";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import ChangePasswordPage from "./pages/changepassword";
import ContestPage from "./pages/contest";
import AdminContestListPage from "./admin/constest";
import AdminCreateContest from "./admin/createcontes";
import AdminEditContest from "./admin/AdminEditContest";
import ContestArena from "./pages/contestarena";
import ContestResultsPage from "./pages/contestresult";
import PairModePage from "./pages/pairMode";
import PairSessionPage from "./pages/PairSessionPage";
function App() {
  const dispatch = useDispatch();
  const { user, is_authenticated, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(check_auth())
  }, [dispatch])

if (loading) {
  return (
    <div className="flex justify-center items-center h-screen p-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animation-delay-75"></div>
      </div>
    </div>
  );
}



  return <>
    <Routes>
      <Route element={<Layout></Layout>}>
        <Route path="/" element={<Home_page />}></Route>
        <Route path="/login" element={is_authenticated ? <Navigate to="/" /> : <Login></Login>}></Route>
        <Route path="/signup" element={is_authenticated ? <Navigate to="/" /> : <Signup></Signup>}></Route>
        <Route path="/problems" element={<ProblemsPage></ProblemsPage>}></Route>
        <Route path="/tscassistant" element={<Tscassistant></Tscassistant>}></Route>
        <Route path="/profile" element={<ProfilePage></ProfilePage>}></Route>
        <Route path="/settings/set-password" element={is_authenticated ? <SetPasswordPage></SetPasswordPage> : <Navigate to="/login"></Navigate>}></Route>
        <Route path="/settings/change-password" element={is_authenticated ? <ChangePasswordPage></ChangePasswordPage> : <Navigate to="/login"></Navigate>}></Route>
        <Route path="/discussion" element={<ForumPage></ForumPage>}></Route>
        <Route path="/question/:id" element={<QuestionDetailPage></QuestionDetailPage>}></Route>
        <Route path="/ask-question" element={<AskQuestionPage />} />
        <Route path="/contest" element={<ContestPage />} />
        <Route path="/contest/:contestId/arena" element={<ContestArena />} />
        <Route path="/contest/:contestId/results" element={<ContestResultsPage></ContestResultsPage>}></Route>
        <Route path="/pair-mode" element={<PairModePage></PairModePage>}></Route>

      </Route>
      <Route path="/problems/:problemId" element={<DsaProblemPage />} />
      <Route path="/problem/:problemId/session/:sessionId" element={<DsaProblemPage />} />
      <Route path="/problem/potd" element={<DsaProblemPage></DsaProblemPage>}></Route>
      <Route element={is_authenticated && user?.role === "admin" ? <AdminLayout></AdminLayout> : <Navigate to="/" />}>
        <Route path="/admin" element={<AdminDashboard></AdminDashboard>}></Route>
        <Route path="/admin/problems/create" element={<CreateProblemPanel></CreateProblemPanel>}></Route>
        <Route path="/admin/update" element={<ProblemsListPage></ProblemsListPage>}></Route>
        <Route path="/edit-problem/:problemId" element={<EditProblemPage></EditProblemPage>}></Route>
        <Route path="/admin/problems/delete" element={<DeleteProblemPage></DeleteProblemPage>}></Route>
        <Route path="/admin/video" element={<AdminVideo></AdminVideo>}></Route>
        <Route path="/admin/video/upload/:problemId" element={<AdminUpload></AdminUpload>}></Route>
        <Route path="/admin/users" element={<ManageUsersPage></ManageUsersPage>}></Route>
        <Route path="/admin/contest" element={<AdminContestListPage></AdminContestListPage>}></Route>
        <Route path="/admin/contests/create" element={<AdminCreateContest></AdminCreateContest>}></Route>
        <Route path="/admin/contests/edit/:contestId" element={<AdminEditContest></AdminEditContest>}></Route>

      </Route>
      <Route path="/payment" element={is_authenticated ? <Paywall /> : <Navigate to="/login"></Navigate>}></Route>

    </Routes>

  </>
}
export default App
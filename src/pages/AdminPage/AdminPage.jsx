import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { adminApi } from "../../api/adminEndpoints";
import { isAbort } from "../../api/client";
import AdminDialog from "../../components/admin/AdminDialog";
import CandidateReview from "../../components/admin/CandidateReview";
import { cx } from "../../components/admin/cx";
import DecisionBoard from "../../components/admin/DecisionBoard";
import FieldWork from "../../components/admin/FieldWork";
import Records from "../../components/admin/Records";
import { INFO, NAV } from "../../components/admin/labels";
import { errorText } from "../../components/admin/shared";
import { ErrorNote } from "../../components/admin/ui";
import useToast from "../../components/admin/useToast";
import Logo from "../../components/common/Logo";

const PAGES = ["home", "review", "field", "records", "evidence"];
const TABS = {
  field: ["todo", "meas", "assets"],
  records: ["ts", "val", "dec"],
};
const INTRO_KEY = "aeroharvest-admin-intro";
const MENU_ORDER = NAV.flatMap(([, pages]) => pages);
const ROLES = [
  ["home", "시설·탄소중립 의사결정자", "후보를 보고 결정합니다"],
  ["field", "현장 측정 담당자", "측정값을 기록합니다", "todo"],
  ["records", "연구팀", "예측·검증을 합니다", "ts"],
  ["evidence", "재무·환경 담당자", "회수기간·탄소 근거를 봅니다", "money"],
];

const pathOf = (page, arg) =>
  `/admin${page === "home" ? "" : `/${page}`}${arg ? `/${encodeURIComponent(arg)}` : ""}`;

function readRoute(pathname) {
  const [page, ...rest] = pathname.replace(/^\/admin\/?/, "").split("/");
  if (!PAGES.includes(page)) return { page: "home", arg: "" };
  try {
    return { page, arg: decodeURIComponent(rest.join("/")) };
  } catch {
    return { page, arg: "" };
  }
}

function hasSeenIntro() {
  try {
    return Boolean(localStorage.getItem(INTRO_KEY));
  } catch {
    return false;
  }
}

function AdminPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const route = readRoute(pathname);
  const info = INFO[route.page];
  const [intro, setIntro] = useState(() => !hasSeenIntro());
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [toastNode, toast] = useToast();
  const [buildingId, setBuildingId] = useState("NICHOLLS");
  const refresh = () => setReload((v) => v + 1);

  const go = (page, arg) => navigate(pathOf(page, arg));

  useEffect(() => {
    document.title = "AeroHarvest 운영";
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      adminApi.buildings(signal),
      adminApi.candidates(undefined, signal),
      adminApi.decisions({}, signal),
      adminApi.defaults(signal),
      adminApi.sensors(signal),
    ])
      .then(([buildings, candidates, decisions, defaults, sensors]) => {
        const rank = (id) =>
          buildings.find((b) => b.id === id)?.priorityRank ?? Infinity;
        setError("");
        setData({
          buildings,
          candidates: candidates.toSorted(
            (a, b) => rank(a.buildingId) - rank(b.buildingId),
          ),
          decisions,
          defaults,
          sensors,
        });
      })
      .catch((e) => !isAbort(e) && setError(errorText(e)));
    return () => controller.abort();
  }, [reload]);

  const tabOf = (page, fallback) =>
    TABS[page].includes(route.arg) ? route.arg : fallback;

  const renderPage = () => {
    switch (route.page) {
      case "home":
        return <DecisionBoard data={data} onOpen={(id) => go("review", id)} />;
      case "review": {
        const reviewId = data.candidates.some((c) => c.id === route.arg)
          ? route.arg
          : (data.candidates[0]?.id ?? "");
        return (
          <CandidateReview
            key={reviewId}
            candidateId={reviewId}
            data={data}
            onSelect={(id) => go("review", id)}
            onGo={(page, id) => {
              setBuildingId(id);
              go(page, page === "field" ? "meas" : "ts");
            }}
            onChanged={refresh}
            toast={toast}
          />
        );
      }
      case "field":
        return (
          <FieldWork
            data={data}
            tab={tabOf("field", "todo")}
            onTab={(tab) => go("field", tab)}
            buildingId={buildingId}
            onBuilding={setBuildingId}
            onChanged={refresh}
            toast={toast}
          />
        );
      case "records":
        return (
          <Records
            key={buildingId}
            data={data}
            tab={tabOf("records", "ts")}
            onTab={(tab) => go("records", tab)}
            buildingId={buildingId}
            onBuilding={setBuildingId}
            onReview={(id) => go("review", id)}
            onField={() => go("field", "meas")}
            toast={toast}
          />
        );
      default:
        return null;
    }
  };

  const closeIntro = (page, arg) => {
    setIntro(false);
    if (page) go(page, arg);
    localStorage.setItem(INTRO_KEY, "seen");
  };

  return (
    <div className={cx("ops")}>
      <header className={cx("top")}>
        <Link className={cx("logo")} to="/admin" aria-label="판단 현황으로">
          <Logo />
        </Link>
        <span className={cx("tag")}>운영</span>
        <span className={cx("tag warn")}>
          담당자용 · 저장하면 실제 DB에 기록됩니다
        </span>
        <span className={cx("spacer")} />
        <Link className={cx("btn sm")} to="/">
          시연 화면으로
        </Link>
        <button
          type="button"
          className={cx("btn sm")}
          onClick={() => setIntro(true)}
        >
          ? 이용 안내
        </button>
      </header>
      <div className={cx("wrap")}>
        <nav className={cx("side")} aria-label="운영 메뉴">
          {NAV.map(([group, pages]) => (
            <div key={group}>
              <div className={cx("navg")}>{group}</div>
              {pages.map((page) => {
                const isCurrent = route.page === page;
                return (
                  <Link
                    key={page}
                    to={pathOf(page)}
                    className={cx(isCurrent && "on")}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    <span className={cx("nnum")}>
                      {MENU_ORDER.indexOf(page) + 1}
                    </span>
                    <span>
                      {INFO[page].ko}
                      <small>{INFO[page].desc}</small>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <main className={cx("main")}>
          <div className={cx("ptitle")}>
            <h1>{info.ko}</h1>
            <span aria-hidden>{info.en}</span>
          </div>
          <div className={cx("todo")}>
            <b>이 화면에서 할 일</b> {info.todo}
          </div>
          <ErrorNote error={error} onRetry={refresh} />
          {data
            ? renderPage()
            : !error && <p className={cx("note")}>불러오는 중…</p>}
          <div className={cx("nextbar")}>
            <span className={cx("note")}>다음 단계</span>
            <button
              type="button"
              className={cx("btn pri")}
              onClick={() => go(info.next[0])}
            >
              {info.next[1]} →
            </button>
          </div>
        </main>
      </div>
      {intro && (
        <AdminDialog title="AeroHarvest 운영" onClose={() => closeIntro()}>
          <h3 className={cx("intro-title")}>
            어느 배기구에 실험할 가치가 있는지 <b>결정하는 곳</b>입니다
          </h3>
          <p className={cx("note lh")}>
            시연 화면이 1차 실측값으로 &ldquo;어디부터 검증할지&rdquo;를 보여
            준다면, 여기서는 그 후보를 실제로 재고, 검증하고, 결정을 기록합니다.
          </p>
          <ol className={cx("steps")}>
            <li>
              <b>후보 보기</b> 판단 현황에서 5곳이 어느 단계인지 봅니다
            </li>
            <li>
              <b>근거 확인</b> 검토서에서 근거를 읽고 부족한 것을 채웁니다
            </li>
            <li>
              <b>결정 남기기</b> 측정 필요·설치 검토·보류를 사유와 함께 남깁니다
            </li>
          </ol>
          <div className={cx("label")}>
            나는 누구인가요? 고르면 맞는 화면으로 갑니다
          </div>
          <div className={cx("grid g2")}>
            {ROLES.map(([page, title, desc, arg]) => (
              <button
                type="button"
                key={title}
                className={cx("role")}
                onClick={() => closeIntro(page, arg)}
              >
                <b>{title}</b>
                <span className={cx("note")}>{desc}</span>
              </button>
            ))}
          </div>
        </AdminDialog>
      )}
      {toastNode}
    </div>
  );
}

export default AdminPage;

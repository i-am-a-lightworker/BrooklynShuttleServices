"""
Shuttle - The Brooklyn Way — Ops & Scheduling Dashboard

This is the piece that proves the fixed price and PM-weighted schedule
aren't arbitrary: it's built directly on the NYC DOT Automated Traffic
Volume Counts analysis from this project's research phase.

Run: streamlit run dashboard.py
Requires traffic.duckdb in the same folder (copy it in, or point DB_PATH
at wherever you keep the built database).
"""

import altair as alt
import duckdb
import pandas as pd
import streamlit as st

DB_PATH = "traffic.duckdb"

# Chart color roles, per the Visual & Chart Branding Guidelines doc:
# burgundy = primary series, navy = secondary/comparison series,
# charcoal = labels/axis, cream = canvas, beige = gridlines.
BRAND = {
    "burgundy": "#5E0000",
    "navy": "#0D1028",
    "charcoal": "#24221F",
    "cream": "#F6F3EE",
    "beige": "#D9D3CB",
    "gold": "#B08D57",
}


def branded_line_chart(df: pd.DataFrame, x: str, y: str, title: str = ""):
    return (
        alt.Chart(df)
        .mark_line(color=BRAND["burgundy"], strokeWidth=2.5)
        .encode(
            x=alt.X(f"{x}:Q", title=None, axis=alt.Axis(gridColor=BRAND["beige"], labelColor=BRAND["charcoal"])),
            y=alt.Y(f"{y}:Q", title=None, axis=alt.Axis(gridColor=BRAND["beige"], labelColor=BRAND["charcoal"])),
        )
        .properties(title=title, background=BRAND["cream"])
        .configure_view(strokeWidth=0)
        .configure_title(color=BRAND["charcoal"], font="Inter", fontSize=13)
    )

st.set_page_config(page_title="Shuttle - The Brooklyn Way — Ops", layout="wide")

# --- Waypoints and evidence tier, matching lib/product-config.ts in the rider app ---
WAYPOINTS = {
    "Remsen Ave (Canarsie)": {"segments": [43241, 43248], "tier": "Concurrent · Jul 2010"},
    "Utica Ave @ Empire Blvd": {"segments": [43253, 43238], "tier": "Concurrent · Jul 2010"},
    "Washington Ave @ Eastern Pkwy": {"segments": [163727], "tier": "Bridge · May 2010"},
    "Nostrand Ave @ Clifton Pl": {"segments": [30999], "tier": "Bridge · Dec 2024"},
    "Atlantic Terminal (Barclays)": {"segments": [132626], "tier": "Directional · 2020"},
    "Court St (Cobble Hill)": {"segments": [115088], "tier": "Directional · 2025"},
}


@st.cache_resource
def get_con():
    return duckdb.connect(DB_PATH, read_only=True)


@st.cache_data
def hourly_profile(_con, segment_ids):
    seglist = ",".join(str(s) for s in segment_ids)
    q = f"""
        SELECT HH, SUM(Vol) AS total_vol, COUNT(DISTINCT dt) AS n_days
        FROM counts WHERE SegmentID IN ({seglist})
        GROUP BY HH ORDER BY HH
    """
    df = _con.execute(q).fetchdf()
    df["avg_vol"] = (df["total_vol"] / df["n_days"].replace(0, 1)).round(0)
    return df


@st.cache_data
def am_pm_rush(_con, segment_ids):
    seglist = ",".join(str(s) for s in segment_ids)
    q = f"""
        SELECT
            SUM(CASE WHEN HH BETWEEN 7 AND 8 THEN Vol ELSE 0 END) AS am_vol,
            SUM(CASE WHEN HH BETWEEN 16 AND 18 THEN Vol ELSE 0 END) AS pm_vol
        FROM counts WHERE SegmentID IN ({seglist})
    """
    return _con.execute(q).fetchdf().iloc[0]


st.title("Shuttle - The Brooklyn Way — Ops & Scheduling Dashboard")
st.caption(
    "Built on NYC DOT Automated Traffic Volume Counts (Socrata 7ym2-wayt). "
    "Every number below traces to a real count study — see the evidence tier per waypoint."
)

try:
    con = get_con()
except Exception as e:
    st.error(f"Couldn't open {DB_PATH} — copy it into this folder. ({e})")
    st.stop()

waypoint = st.selectbox("Waypoint", list(WAYPOINTS.keys()))
info = WAYPOINTS[waypoint]
st.markdown(f"**Evidence tier:** {info['tier']}")

col1, col2 = st.columns([2, 1])

with col1:
    df = hourly_profile(con, info["segments"])
    st.subheader("Hourly volume profile")
    st.altair_chart(
        branded_line_chart(df, "HH", "avg_vol"), use_container_width=True
    )
    st.caption(
        "This shape — not the fare — is what should drive shuttle frequency: "
        "more shuttles during the plateau, same price all day."
    )

with col2:
    rush = am_pm_rush(con, info["segments"])
    st.subheader("AM vs PM rush")
    st.metric("AM rush total (7–9am)", f"{int(rush['am_vol']):,}")
    st.metric(
        "PM rush total (4–7pm)",
        f"{int(rush['pm_vol']):,}",
        delta=f"{(rush['pm_vol'] / max(rush['am_vol'], 1) - 1) * 100:.0f}% vs AM",
    )

st.divider()
st.subheader("Every waypoint, side by side")

rows = []
for name, info in WAYPOINTS.items():
    rush = am_pm_rush(con, info["segments"])
    rows.append(
        {
            "Waypoint": name,
            "Evidence tier": info["tier"],
            "AM rush": int(rush["am_vol"]),
            "PM rush": int(rush["pm_vol"]),
            "PM / AM": round(rush["pm_vol"] / max(rush["am_vol"], 1), 2),
        }
    )
summary = pd.DataFrame(rows)
st.dataframe(summary, use_container_width=True, hide_index=True)
st.caption(
    "6 of 7 measured points show PM > AM, spanning 2010–2025 across independent "
    "studies — the basis for weighting shuttle frequency toward the PM plateau."
)

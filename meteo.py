from bdd.connection import Conn
from datetime import datetime


def transf_date(d):
    # vérification et conversion de format de date
    if isinstance(d, str):
        d = datetime.strptime(d, "%Y-%m-%d").date()
    elif isinstance(d, datetime):
        d = d.date()
    return d


def idx_to_date(d: datetime) -> str:
    # mise en forme des dates sous forme 01 jan
    mois = d.strftime("%m")
    jours = d.strftime("%d")
    
    mois_r = {
    "01": "jan",
    "02": "fev",
    "03": "mars",
    "04": "avr",
    "05": "mai",
    "06": "juin",
    "07": "jui",
    "08": "aout",
    "09": "sep",
    "10": "oct",
    "11": "nov",
    "12": "dec"
    }

    mois_c = mois_r[mois]
    return f"{jours} {mois_c}"


def index_dates() -> list:
    # création d'un index temporel mis en forme
    
    sql = """select date_reelle from meteo where extract(year from date_reelle)=2017 and code_insee=29030 order by date_reelle;"""
    conn = Conn()
    data = conn.commit_and_drop_all(sql)
    dates_r = {}
    for i in range(len(data)):
        j = str(i+1)
        dates_r[j] = idx_to_date(transf_date(data[i][0]))
       
    return dates_r


def verif_data(data:list, i:int, col:int) -> float:
    # vérification donnée manquante
    if data[i][col] is None:
        res = 0
    elif data[i][col] == -99:
        res = 0
    else:
        res = data[i][col]
    return res


def cum_meteo_js() -> list:
    #  retourne un json dans une liste
    sql = "select tmin, tmax, rr10, date_reelle from meteo where EXTRACT(doy from date_reelle)!=366 and code_insee=29030 order by date_reelle;"
    data = Conn().commit_and_drop_all(sql)
    tmin = []
    tmax = []
    rr10 = []
    dates_r = []
    for i in range(len(data)):    
        tmax.append(verif_data(data, i, 0))
        tmin.append(verif_data(data, i, 1))
        rr10.append(verif_data(data, i, 2))
        dates_r.append(idx_to_date(transf_date(data[i][3])))
    return [{"tmin":tmin, "tmax":tmax, "pluie":rr10, "dates":dates_r, "aujdui" : datetime.now().timetuple().tm_yday}]




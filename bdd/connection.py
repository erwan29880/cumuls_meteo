from bdd import param
import psycopg2
from datetime import date

class Conn:
    
    """
    classe de connexion à la base de données
    """

    
    def __init__(self):
    
        self.__host = param.HOST 
        self.__user = param.USER
        self.__password = param.PASSWORD
        self.__database = param.DATABASE
        self.__port = param.PORT
        self.cur = None
        self.conn = None


    def ouvrir(self) -> None:
        self.conn = psycopg2.connect(
        host=self.__host,
        database=self.__database,
        user=self.__user,
        password=self.__password, 
        port=self.__port)
        self.cur = self.conn.cursor()


    def commit_and_drop_all(self, sql) -> list:
        self.ouvrir()
        self.cur.execute(sql)
        res = self.cur.fetchall()
        self.conn.commit()
        self.fermer()
        return res


    def fermer(self) -> None:
        self.cur.close()
        self.conn.close()
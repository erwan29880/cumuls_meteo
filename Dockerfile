FROM python:3.8

WORKDIR /app
COPY requirements.txt /app

RUN pip install -U pip
RUN pip install -r requirements.txt

CMD tail -f /dev/null
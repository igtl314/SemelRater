# My Semel Viewer

## Deployment

The site is deployed at [https://semla.mardo.dev](https://semla.mardo.dev) and api at [https://api.mardo.dev](https://api.mardo.dev)

## Local setup

To set the project up loacally you could run

    docker  compuse  up  --build

But i ran into some weird bugs with the premessions issues when i deployed it at my server (ubuntu) but 0 on my windows laptop.

### Backend

so if that don't work it is possible to run the project by first creating a python venv in this directory

    python -m venv .

Then installing the requirments

    python -m pip -r install requirements.txt

After that

```bash

python manage.py makemigrations

python manage.py migrate

python manage.py runserver
```

This start the backend at port 8000

### Frontend

The frontend is created with Next.Js and only uses client fetches to the api.

To start the front end, cd into `frontend` and run

    npm  install

Then check the .env.local file to ensure that the api path is correct.

Then run

    npm  run  dev

This starts the frontend at port 3000

### Features

- It it possible to enable / disable dark mode by pressing the icon in the right corner.
- Due to the api server being pubbicly availbe and the response is on json people can extend this application and write new small appliations.
- There is also a mobile design so mobile users can use the website without any trouble, aka rate-on-the-go.

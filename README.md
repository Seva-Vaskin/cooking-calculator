# Installation

([This tutorial](https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uwsgi-and-nginx-on-ubuntu-22-04)
was used to perform installation)

* ``git clone https://github.com/Seva-Vaskin/cooking-calulator.git``
* ``cd cooking-calculator``
* ``sudo apt install python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv``
* ``python3 -m venv cookingenv``
* ``source cookingvenv/bin/activate``
* ``pip install -r requirements.txt``
* ``sudo vi /etc/systemd/cooking.service``
* In opened file create service based on template code provided below:

```
[Unit]
Description=uWSGI instance to serve cooking calulator
After=network.target

[Service]
User=cook
Group=www-data
WorkingDirectory=/home/cook/cooking-calulator
Environment="PATH=/home/cook/cooking-calulator/cookingvenv/bin"
ExecStart=/home/cook/cooking-calulator/cookingvenv/bin/uwsgi --ini cooking.ini

[Install]
WantedBy=multi-user.target
```

* ``sudo chgrp www-data /home/cook`` Where ``/home/cook`` should be changed to your home directory
* ``sudo systemctl start cooking``
* ``sudo systemctl enable cooking``
* Check status ``sudo systemctl status cooking``
* Create nginx configuration ``sudo vi /etc/nginx/sites-available/cooking`` using template below

```
server {
    listen 80;
    server_name cooking www.cooking;

    location / {
        include uwsgi_params;
        uwsgi_pass unix:/home/cook/cooking-calulator/cooking.sock;
    }
}
```

* Enable configuration ``sudo ln -s /etc/nginx/sites-available/cooking /etc/nginx/sites-enabled``
* Unlink default configuration ``sudo unlink /etc/nginx/sites-enabled/default``

## SSL installation

* ``sudo apt install certbot python3-certbot-nginx``
* ``sudo certbot --nginx -d your_domain -d www.your_domain``

## Postgres installation

[This tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-20-04) was
used to perform installation

## Configuring

* Create a copy of `auth.ini.example` named `auth.example` and configure postgres connection information 
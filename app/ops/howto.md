## First-Time Server Setup (Once)
sudo useradd -r -s /bin/false morchess
sudo mkdir -p /var/www/morchess-api/data
sudo chown -R morchess:morchess /var/www/morchess-api

## Enable It
sudo systemctl daemon-reload
sudo systemctl enable morchess
sudo systemctl start morchess

## Check logs:
journalctl -u morchess -f


## Restart
sudo systemctl restart morchess

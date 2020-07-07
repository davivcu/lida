### Developer mode

The developer uses the root of the Matilda-dev repository.

To test the code, the developer deploys locally the three containers: the app, the db, and the proxy, using the command:

	$ sudo docker compose build
    $ sudo docker-compose up
    
To stop the local deployment the devoloper uses Crtl-C in the terminal where the docker-compose command is running.
    
Before launching the test, the developer must create an appropriate certificate, otherwise the app will only be accessible on port 5000 using HTTP. To create a self-signed certificate use the following command in the nginx_conf directory:

	$ openssl req -subj '/CN=localhost' -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365

To produce a new release, the developer issues the command:

    $ sudo docker-compose push
    
which will update the images on the docker hub.


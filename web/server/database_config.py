##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
#import sys
import json

# == Pymongo ==
from pymongo import MongoClient

# == Local ==
import utils


##############################################
#  CONFIGURATION VALUES
##############################################
# Config with your database parameters
# This setting is default for local databases

class DatabaseConfiguration:

	with open('../../configuration/conf.json') as json_file:
		conf = json.load(json_file)

	databaseURI = utils.database_uri_compose(conf["database"])

	client = MongoClient(databaseURI)

	print(" * Connected to database")

	db = client[conf["database"]["name"]]

	administratorDefault = conf["lida_admin"]

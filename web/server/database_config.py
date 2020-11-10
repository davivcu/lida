##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
#import sys
import json

# == Pymongo ==
from pymongo import MongoClient

class DatabaseConfiguration:
	with open('/app/matilda_conf/conf.json') as json_file:
		conf = json.load(json_file)
	client = MongoClient(conf["db_uri"])
	db = client["lidadb"]
	print(" * Connected")
	users = db["users"]
	dialogueCollections = db["dialogues_collections"]
	annotatedCollections = db["annotated_collections"]

	administratorDefault = conf["lida_admin"]


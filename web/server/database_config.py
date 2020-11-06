##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
import json
import datetime
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
from pprint import pprint
import functools
import ast

# == Flask ==
from flask import Flask
from flask_cors import CORS

# == Pymongo ==
from pymongo import MongoClient
from bson.objectid import ObjectId

# == Local ==
import utils


##############################################
#  CONFIGURATION VALUES
##############################################
# Config with your database parameters
# This setting is default for local databases

class DatabaseConfiguration:

	print(" * Connecting to DB")

# 	user may be None if not used, 
#	if username is given a password is required too (otherwise None)
	username = 'augusto'
	password = 'qwe111'

#   Can be local or remote, 27017 is default mongoDB port
	server = "cluster0-wyaud.mongodb.net"

#	You can also replace this with your external database uri
	databaseURI = utils.database_uri_compose(server,username,password)

	client = MongoClient(databaseURI)
	db = client["lidadb"]

	print(" * Connected")

	users = db["users"]
	dialogueCollections = db["dialogues_collections"]
	annotatedCollections = db["annotated_collections"]

	administratorDefault = {"id":"admin","userName":"admin","password":"admin","email":"","role":"administrator"}



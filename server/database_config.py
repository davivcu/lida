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


##############################################
#  CONFIGURATION VALUES
##############################################
# Config with your database

class DatabaseConfiguration:

#	databaseLocation = "localhost" 
#	databasePort = 27017

#	client = MongoClient(databaseLocation,databasePort)
#	db = client.mymongodb
	print("Connecting to DB");
	client = MongoClient("mongodb+srv://augusto:asterix@cluster0-wyaud.mongodb.net/<dbname>?retryWrites=true&w=majority")
	db = client.mymongodb
	serverStatusResult=db.command("serverStatus")
	pprint(serverStatusResult)
	collection = db.lida_database
	users = db.lida_users
	dialogues = db.lida_dialogues


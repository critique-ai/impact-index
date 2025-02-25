

this was meant to be a project I'm trying to speed run, so inefficiency is expected. Having said that, the main motivation behind this was to get a good roast going on my system design, so by all means, let me know if you see any issues.

also, adding a new site is literally simply creating a new class with two methods so if you feel like adding a site, feel free to contribute. 


INSTRUCTIONS: 



##BACKEND## 

to run locally:

PREREQUISITES: 

 for reddit: 
 you need to get a reddit client id and secret, and a reddit user agent. by signing up for a developer account on reddit, and creating an app. 

 for youtube: 
 you need to get a youtube api key. by signing up for a developer account on youtube, and creating an app.

 for platform metadata requests (not being used atm actually ): 
    we use a Critique AI API to get the live count for total entities available for each site (total active channels for Youtube, total active users for Reddit, etc) and for other live info endpoints as well, you can get an API key and sign up on https://critique-labs.ai/en/design


create .env.local file using the .env.template file as a reference.

1. docker compose --build up 

##adding a new site to support:##

1. create a new directory in the sites folder with an __init__.py file
2. In this file, create a class that inherits from SiteWorker, the classname is irrelevant, but the self.name of the class must match the name of the directory, populate the class variables description, hIndexDescription, entityName, and metricName.
3. implement the entity_info method - this function should return an EntityInfo object, which contains the records and metadata for the given entity. The records are the data used to calculate the h-index, and the metadata is the url and identifier for the entity.
4. implement the get_related_entities method - this function should return a list of entities that are related to the given entity. For example, if the site is reddit, the get_related_entities method should return a list of reddit entities(users) that have either commented on a post by this entity. This is up to you to define, if it's too narrow you might end up not traversing the entire graph, if its too wide, it'll just take longer that's all. 
5. run pytest tests/ and make sure your new site passes all the tests (docker compose up runs the test suite anyways though)



##FRONTEND## 

to run locally: 

1. bun install 
2. bun run dev 

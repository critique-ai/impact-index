

this was meant to be a project I'm trying to speed run, so inefficiency is expected. Having said that, the main motivation behind this was to get a good roast going on my system design, so by all means, let me know if you see any issues.



INSTRUCTIONS: 



##BACKEND## 

to run locally:

1. docker compose --build up 

adding a new site to support:


1. create a new directory in the sites folder with an __init__.py file
2. In this file, create a class that inherits from SiteWorker, the classname is irrelevant, but the self.name of the class must match the name of the directory.
3. implement the records_for_entity method - this function should return a list of records for the given entity, that will be used to calculate the h-index. For example, if the site is github, the records_for_entity method should return a list of github repositories for the given entity. In this function you are deciding the logic for what data to use to calculate the h-index, so the record.metric for example is the actual number used to calculate the h-index, in the case of reddit, it's the number of upvotes.
4. implement the get_related_entities method - this function should return a list of entities that are related to the given entity. For example, if the site is reddit, the get_related_entities method should return a list of reddit entities(users) that have either commented on a post by this entity. This is up to you to define, if it's too narrow you might end up not traversing the entire graph, if its too wide, it'll just take longer that's all. 
5. run pytest tests/ and make sure your new site passes all the tests



##FRONTEND## 

to run locally: 

1. bun install 
2. bun run build 
3. bun run dev 
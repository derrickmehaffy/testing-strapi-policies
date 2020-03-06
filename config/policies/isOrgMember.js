module.exports = async (ctx, next) => {
  let route = ctx.request.route;

  // Use these to log data coming from the user
  // Koa Docs: https://koajs.com/#request
  // console.log(ctx.request.route);
  // console.log(ctx.query)
  // console.log(ctx.params)
  // console.log(ctx.request.body)
  // console.log(ctx.state.user)

  if (ctx.state.user) {
  // FIND & COUNT
    if (route.action === "find" || route.action === "count") {
      // Two ways to handle this
      // Way 1: forcefully set the query params to filter

      if (Object.keys(ctx.query).length === 0) {
        ctx.query = {
          organisation: ctx.state.user.organisation
        };
      } else {
        ctx.query.organisation = ctx.state.user.organisation;
      }
      console.log(ctx.query);
      return await next();

      // Way 2: check params if a user is looking for posts that aren't theirs and send error
      // if (Object.keys(ctx.query).length === 0) {
      //   ctx.query = {
      //     organisation: ctx.state.user.organisation
      //   };
      // } else if (
      //   Object.keys(ctx.query).includes('organisation') === false
      // ) {
      //   ctx.query.organisation = ctx.state.user.organisation;
      // } else if (
      //   ctx.query.organisation !== ctx.state.user.organisation
      // ) {
      //   return ctx.unauthorized("You are not a member of this Organization");
      // } else {
      //   return ctx.notImplemented();
      // }
      // return await next();
  // FINDONE
    } else if (route.action === "findone") {
      let data = await strapi.query(route.controller).findOne({id: ctx.params.id}, [])

      if (data) {
        if (data.organisation !== ctx.state.user.organisation) {
          return ctx.unauthorized("You are not a member of this Organization");
        } else {
          return await next();
        }
      }
    } else if (route.action === "create") {
      // Again as with find/count you can do this two ways, here is way 1
      if (ctx.request.body.organisation) {
        ctx.request.body.organisation = ctx.state.user.organisation
        return await next();
      } else {
        return ctx.badRequest('Org is required')
      }
    } else if (route.action === "update") {
      // Again as with find/count you can do this two ways, here is way 1
      if (ctx.request.body.organisation) {
        ctx.request.body.organisation = ctx.state.user.organisation
      }
      return await next();
    } else if (route.action === "delete") {
      let data = await strapi.query(route.controller).findOne({id: ctx.params.id}, [])

      if (data) {
        if (data.organisation === ctx.state.user.organisation) {
          return await next();
        } else {
          return ctx.unauthorized("You are not a member of this Organization");
        }
      }
    }
  }
  return await next();
};

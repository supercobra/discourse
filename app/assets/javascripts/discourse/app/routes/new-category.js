import I18n from "I18n";
import DiscourseRoute from "discourse/routes/discourse";
import { SEARCH_PRIORITIES } from "discourse/lib/constants";
import { Promise } from "rsvp";

export default DiscourseRoute.extend({
  model() {
    return Promise.resolve(this.groupPermissions())
      .then((permissions) => {
        return this.newCategoryWithPermissions(permissions);
      })
      .catch(() => {
        return this.newCategoryWithPermissions(this.defaultGroupPermissions());
      });
  },

  newCategoryWithPermissions(group_permissions) {
    return this.store.createRecord("category", {
      color: "0088CC",
      text_color: "FFFFFF",
      group_permissions,
      available_groups: this.site.groups.map((g) => g.name),
      allow_badges: true,
      topic_featured_link_allowed: true,
      custom_fields: {},
      search_priority: SEARCH_PRIORITIES.normal,
    });
  },

  titleToken() {
    return I18n.t("category.create");
  },

  groupPermissions() {
    // Override this function if you want different groupPermissions from a plugin.
    // If your plugin override fails, permissions will fallback to defaultGroupPermissions
    return this.defaultGroupPermissions();
  },

  defaultGroupPermissions() {
    return [
      {
        group_name: this.site.groups.findBy("id", 0).name,
        permission_type: 1,
      },
    ];
  },

  renderTemplate() {
    this.render("edit-category-tabs", {
      controller: "edit-category-tabs",
      model: this.currentModel,
    });
  },
});

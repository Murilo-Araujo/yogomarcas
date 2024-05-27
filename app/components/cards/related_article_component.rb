
module Cards
  class RelatedArticleComponent < ViewComponent::Base
    include BlogsHelper
    def initialize(article:, category: nil)
      @article = article
      @category = category
    end
  end
end
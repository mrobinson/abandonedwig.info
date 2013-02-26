module Jekyll

    class Post
      alias_method :original_to_liquid, :to_liquid

      def to_liquid
        data = original_to_liquid
        data['filename'] = @name
        return data
      end
    end

end

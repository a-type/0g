import * as React from 'react';
import { Flex, Text } from 'rebass';

export function HomePage() {
  return (
    <article>
      <Flex
        flexDirection="column"
        alignItems="center"
        p={2}
        width="100vw"
        height="80vh"
      >
        {/* Game goes here ... */}
      </Flex>
      <section>
        <Text>Stuff about library goes here</Text>
      </section>
    </article>
  );
}
